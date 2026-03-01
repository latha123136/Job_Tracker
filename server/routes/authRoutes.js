const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password, role, ...roleSpecificData } = req.body;

    if (!['applicant', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      ...roleSpecificData,
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Add role-specific fields to response
    if (role === 'applicant') {
      Object.assign(userResponse, {
        college: user.college,
        branch: user.branch,
        year: user.year,
        skills: user.skills,
        phone: user.phone,
        experience: user.experience
      });
    } else if (role === 'recruiter') {
      Object.assign(userResponse, {
        company: user.company,
        designation: user.designation,
        companySize: user.companySize,
        industry: user.industry,
        verified: user.verified
      });
    }

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Add role-specific fields to response
    if (user.role === 'applicant') {
      Object.assign(userResponse, {
        college: user.college,
        branch: user.branch,
        year: user.year,
        skills: user.skills,
        phone: user.phone,
        experience: user.experience,
        resume: user.resume
      });
    } else if (user.role === 'recruiter') {
      Object.assign(userResponse, {
        company: user.company,
        designation: user.designation,
        companySize: user.companySize,
        industry: user.industry,
        verified: user.verified
      });
    }

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, college, branch, year, skills, phone, experience } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    }
    
    user.name = name;
    user.email = email;
    user.college = college;
    user.branch = branch;
    user.year = year;
    user.skills = skills;
    user.phone = phone;
    user.experience = experience;
    
    await user.save();
    
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      branch: user.branch,
      year: user.year,
      skills: user.skills,
      phone: user.phone,
      experience: user.experience
    };
    
    res.json({ user: userResponse });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
