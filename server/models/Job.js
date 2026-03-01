const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], required: true },
  mode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
  description: { type: String, required: true },
  requirements: [String],
  skills: [String],
  experience: { type: String, required: true },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  benefits: [String],
  applicationDeadline: Date,
  applicationUrl: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Closed', 'Draft'], default: 'Active' },
  
  // Source tracking
  source: { type: String, enum: ['internal', 'external'], default: 'internal' },
  externalId: String, // For tracking external job IDs
  externalSource: String, // e.g., 'indeed', 'linkedin', 'glassdoor'
  
  // Make recruiter optional for external jobs
  recruiter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { return this.source === 'internal'; }
  },
  
  applicationsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  // External job specific fields
  externalData: {
    originalUrl: String,
    postedDate: Date,
    lastUpdated: Date,
    companyLogo: String,
    jobBoard: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);