const express = require('express');
const InterviewExperience = require('../models/InterviewExperience');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/interviews/public - Get public interview experiences with optional filters
router.get('/public', async (req, res) => {
  try {
    const { company, role, difficulty, result, type } = req.query;
    const filter = { visibility: 'Public' };
    
    if (company) filter.company = new RegExp(company, 'i');
    if (role) filter.position = new RegExp(role, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (result) filter.result = result;
    if (type) filter.type = type;

    const experiences = await InterviewExperience.find(filter)
      .select('-userId') // Don't expose user IDs in public endpoint
      .sort({ createdAt: -1 });
    
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all interview experiences for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const experiences = await InterviewExperience.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new interview experience
router.post('/', authMiddleware, async (req, res) => {
  try {
    const experience = new InterviewExperience({
      ...req.body,
      userId: req.user._id
    });
    const savedExperience = await experience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an interview experience (only if user owns it)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await InterviewExperience.findOne({ _id: req.params.id, userId: req.user._id });
    if (!experience) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }
    
    Object.assign(experience, req.body);
    const updatedExperience = await experience.save();
    res.json(updatedExperience);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an interview experience (only if user owns it)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const experience = await InterviewExperience.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!experience) {
      return res.status(404).json({ message: 'Interview experience not found' });
    }
    res.json({ message: 'Interview experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/interviews/all - Get all public interview experiences for registered users
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { company, role, difficulty, result, type } = req.query;
    const filter = { visibility: 'Public' };
    
    if (company) filter.company = new RegExp(company, 'i');
    if (role) filter.position = new RegExp(role, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (result) filter.result = result;
    if (type) filter.type = type;

    const experiences = await InterviewExperience.find(filter)
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;