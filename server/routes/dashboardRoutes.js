const express = require('express');
const Application = require('../models/Application');
const CodingLog = require('../models/CodingLog');
const InterviewExperience = require('../models/InterviewExperience');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [applicationsCount, interviewsCount, codingLogs, experiences] =
      await Promise.all([
        Application.countDocuments({ userId }),
        Application.countDocuments({ userId, status: { $in: ['Interview', 'Offer'] } }),
        CodingLog.find({ userId }),
        InterviewExperience.countDocuments({ userId }),
      ]);

    const solvedQuestions = codingLogs.length;
    const needsRevision = codingLogs.filter(c => c.status === 'Needs Revision').length;

    // Simple example scoring – you can tune these weights
    const scoreComponents = {
      applications: Math.min(applicationsCount / 30, 1),   // target 30 applications
      coding: Math.min(solvedQuestions / 200, 1),          // target 200 questions
      interviews: Math.min(interviewsCount / 10, 1),       // target 10 interviews
    };

    const readinessScore = Math.round(
      (scoreComponents.applications * 0.3 +
        scoreComponents.coding * 0.5 +
        scoreComponents.interviews * 0.2) * 100
    );

    res.json({
      applicationsCount,
      interviewsCount,
      solvedQuestions,
      needsRevision,
      experiencesCount: experiences,
      readinessScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard summary' });
  }
});

module.exports = router;