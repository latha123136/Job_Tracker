const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Experience = require('../models/Experience');

// @route   POST api/experience
// @desc    Add new experience
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newExperience = new Experience({
      ...req.body,
      user: req.user._id,
    });

    const experience = await newExperience.save();
    res.json(experience); // Return the newly created experience
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/experience
// @desc    Get all experiences for a user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user._id }).sort({ from: -1 });
    res.json(experiences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/experience/:id
// @desc    Delete an experience
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ msg: 'Experience not found' });

    // Make sure user owns the experience
    if (experience.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Experience.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Experience removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;