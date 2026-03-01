const express = require('express');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/applications - Get all applications for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const apps = await Application.find({ userId })
      .populate('jobId', 'title company location')
      .sort({ appliedDate: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/applications/follow-ups - Get applications that need follow-up
router.get('/follow-ups', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const followUpApps = await Application.find({
      userId,
      followUpDate: { $lte: today },
      reminderStatus: { $ne: 'Done' }
    })
      .populate('jobId', 'title company location')
      .sort({ followUpDate: 1 });
    
    res.json(followUpApps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/applications - Create new application
router.post('/', authMiddleware, async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.user.id
    });
    const savedApp = await application.save();
    await savedApp.populate('jobId', 'title company location');
    res.status(201).json(savedApp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/applications/:id - Update application status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    Object.assign(application, req.body);
    const updatedApp = await application.save();
    await updatedApp.populate('jobId', 'title company location');
    
    res.json(updatedApp);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/applications/job/:jobId/count - Get application count for a specific job
router.get('/job/:jobId/count', authMiddleware, async (req, res) => {
  try {
    const count = await Application.countDocuments({ jobId: req.params.jobId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;