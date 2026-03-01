const express = require('express');
const CodingLog = require('../models/CodingLog');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all coding logs for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /coding-logs - User ID:', req.user._id);
    const logs = await CodingLog.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log('Found logs:', logs.length);
    res.json(logs);
  } catch (error) {
    console.error('GET /coding-logs error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get coding statistics for weak topic detection
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await CodingLog.find({ user: userId });

    const topicCounts = {};
    const topicNeedsRevision = {};

    logs.forEach((log) => {
      const topic = log.topic || 'Other';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      if (log.status === 'Needs Revision') {
        topicNeedsRevision[topic] = (topicNeedsRevision[topic] || 0) + 1;
      }
    });

    res.json({
      topicCounts,
      topicNeedsRevision,
      total: logs.length,
    });
  } catch (error) {
    console.error('GET /coding-logs/stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new coding log
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /coding-logs - User ID:', req.user._id);
    console.log('Request body:', req.body);
    const log = new CodingLog({
      ...req.body,
      user: req.user._id
    });
    console.log('Creating log:', log);
    const savedLog = await log.save();
    console.log('Saved log:', savedLog);
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('POST /coding-logs error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a coding log (only if user owns it)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await CodingLog.findOne({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return res.status(404).json({ message: 'Coding log not found' });
    }
    
    Object.assign(log, req.body);
    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a coding log (only if user owns it)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const log = await CodingLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) {
      return res.status(404).json({ message: 'Coding log not found' });
    }
    res.json({ message: 'Coding log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;