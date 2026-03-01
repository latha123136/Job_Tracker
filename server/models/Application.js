const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { 
    type: String, 
    enum: ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'], 
    default: 'Applied' 
  },
  appliedDate: { type: Date, default: Date.now },
  notes: String,
  followUpDate: { type: Date },
  reminderStatus: { type: String, enum: ['None', 'Pending', 'Done'], default: 'None' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);