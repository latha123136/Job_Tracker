const express = require('express');
const Goal = require('../models/Goal');
const CodingLog = require('../models/CodingLog');
const Application = require('../models/Application');
const InterviewExperience = require('../models/InterviewExperience');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all goals for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get goals with auto-calculated progress
router.get('/with-progress', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const goalsWithProgress = await Promise.all(goals.map(async (goal) => {
      let calculatedCurrentValue = goal.currentValue;
      
      // Auto-calculate progress based on category
      if (goal.category === 'Coding') {
        const codingCount = await CodingLog.countDocuments({ user: req.user._id });
        calculatedCurrentValue = codingCount;
      } else if (goal.category === 'Applications') {
        const applicationCount = await Application.countDocuments({ userId: req.user._id });
        calculatedCurrentValue = applicationCount;
      } else if (goal.category === 'Interview') {
        const interviewCount = await InterviewExperience.countDocuments({ userId: req.user._id });
        calculatedCurrentValue = interviewCount;
      }
      
      // Update status based on progress
      let status = goal.status;
      if (calculatedCurrentValue >= goal.targetValue) {
        status = 'Completed';
      } else if (calculatedCurrentValue > 0) {
        status = 'In Progress';
      }
      
      return {
        ...goal.toObject(),
        calculatedCurrentValue,
        status,
        progressPercentage: goal.targetValue ? Math.min(100, (calculatedCurrentValue / goal.targetValue) * 100) : 0
      };
    }));
    
    res.json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.user._id
    });
    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a goal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    Object.assign(goal, req.body);
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;