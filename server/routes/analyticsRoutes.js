const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getApplicationAnalytics, getRecruiterAnalytics } = require('../services/analyticsService');
const { exportApplicationsToCSV, generateApplicationReport } = require('../services/exportService');

// Get application analytics
router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const { timeRange = 30 } = req.query;
    const analytics = await getApplicationAnalytics(req.user.id, parseInt(timeRange));
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recruiter analytics
router.get('/recruiter', authMiddleware, async (req, res) => {
  try {
    const analytics = await getRecruiterAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export applications to CSV
router.get('/export/csv', authMiddleware, async (req, res) => {
  try {
    const csv = await exportApplicationsToCSV(req.user.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate application report
router.get('/report', authMiddleware, async (req, res) => {
  try {
    const report = await generateApplicationReport(req.user.id);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
