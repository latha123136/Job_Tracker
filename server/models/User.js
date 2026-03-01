const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['applicant', 'recruiter'], required: true },
    
    // Applicant fields
    college: String,
    branch: String,
    year: String,
    skills: [String],
    resume: String,
    phone: String,
    experience: String,
    
    // Recruiter fields
    company: String,
    designation: String,
    companySize: String,
    industry: String,
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
