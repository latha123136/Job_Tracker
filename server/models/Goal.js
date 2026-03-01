const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['Coding', 'Applications', 'Interview', 'Other'], default: 'Other' },
  targetValue: { type: Number }, // e.g. 100 questions / 30 applications
  currentValue: { type: Number, default: 0 }, // will be auto-calculated sometimes
  startDate: Date,
  endDate: Date,
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);