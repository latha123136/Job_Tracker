const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundType: String,          // "OA" | "Technical 1" | "Technical 2" | "HR"
  description: String,
  questions: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
});

const interviewExperienceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    interviewDate: Date,
    interviewType: { type: String, enum: ['Technical', 'Behavioral', 'System Design', 'HR', 'Final'] },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    outcome: { type: String, enum: ['Pending', 'Selected', 'Rejected'] },
    questions: String,
    experience: String,
    feedback: String,
    // New fields
    type: { type: String, enum: ['On-campus', 'Off-campus', 'Referral'], default: 'Off-campus' },
    location: String,
    result: { type: String, enum: ['Selected', 'Rejected', 'In Progress'], default: 'In Progress' },
    visibility: { type: String, enum: ['Private', 'Public'], default: 'Private' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewExperience', interviewExperienceSchema);
