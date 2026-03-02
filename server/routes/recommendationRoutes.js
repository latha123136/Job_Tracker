const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getJobRecommendations, getSkillGapAnalysis, calculateMatchScore } = require('../services/matchingService');
const Job = require('../models/Job');
const User = require('../models/User');

// Get job recommendations
router.get('/jobs', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await getJobRecommendations(req.user.id, parseInt(limit));
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get skill gap analysis for a specific job
router.get('/skill-gap/:jobId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const job = await Job.findById(req.params.jobId);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const analysis = getSkillGapAnalysis(user.skills, job.skills);
    const matchScore = calculateMatchScore(user.skills, job.skills, user.experience, job.experience);
    
    res.json({ ...analysis, matchScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
