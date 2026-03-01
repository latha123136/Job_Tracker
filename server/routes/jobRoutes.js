const express = require('express');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all active jobs including internships (public) - shows only internal jobs
router.get('/', async (req, res) => {
  try {
    const { search, location, type, mode } = req.query;
    let query = { status: 'Active', source: 'internal' }; // Only show internal jobs
    
    // Only apply filters if they are provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (mode) query.mode = mode;

    const jobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .select('title company location type mode description salary applicationUrl applicationDeadline createdAt views')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all internships (public) - shows only internal internships
router.get('/internships', async (req, res) => {
  try {
    const { search, location, mode } = req.query;
    let query = { status: 'Active', type: 'Internship', source: 'internal' }; // Only show internal internships
    
    // Only apply filters if they are provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (mode) query.mode = mode;

    const internships = await Job.find(query)
      .populate('recruiter', 'name company')
      .select('title company location type mode description salary applicationUrl applicationDeadline createdAt views')
      .sort({ createdAt: -1 });
    
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get mixed jobs (internal + external) - MUST be before /:id route
router.get('/all', async (req, res) => {
  try {
    const { search, location, type, mode, source } = req.query;
    let query = { status: 'Active', source: 'internal' }; // Only show internal jobs
    
    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (mode) query.mode = mode;

    const jobs = await Job.find(query)
      .select('title company location type mode description salary applicationUrl applicationDeadline createdAt views source externalSource externalData recruiter')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Populate recruiter for internal jobs
    const populatedJobs = await Job.populate(jobs, {
      path: 'recruiter',
      select: 'name company'
    });
    
    res.json(populatedJobs);
  } catch (error) {
    console.error('Error in /all endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name company');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Increment views
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job (recruiter only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }
    
    // Validate application URL
    if (req.body.applicationUrl) {
      try {
        new URL(req.body.applicationUrl);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid application URL format' });
      }
    }
    
    const job = new Job({
      ...req.body,
      recruiter: req.user._id,
      source: 'internal'
    });
    
    const savedJob = await job.save();
    await savedJob.populate('recruiter', 'name company');
    
    // Emit real-time event for new job
    const io = req.app.get('io');
    io.emit('newJob', savedJob);
    
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update job (recruiter only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Validate application URL if being updated
    if (req.body.applicationUrl) {
      try {
        new URL(req.body.applicationUrl);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid application URL format' });
      }
    }
    
    Object.assign(job, req.body);
    job.lastUpdated = new Date();
    const updatedJob = await job.save();
    await updatedJob.populate('recruiter', 'name company');
    
    // Emit real-time event for job update
    const io = req.app.get('io');
    io.emit('jobUpdated', updatedJob);
    
    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete job (recruiter only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get job statistics by type
router.get('/stats/types', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recruiter's jobs
router.get('/my/jobs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;