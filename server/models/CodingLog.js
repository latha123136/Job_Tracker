const mongoose = require('mongoose');

const CodingLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  description: { type: String, required: true },
  topic: { 
    type: String, 
    required: true,
    enum: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables', 'Stacks', 'Queues', 'Recursion', 'Backtracking', 'Greedy', 'Math', 'Bit Manipulation', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    required: true,
    enum: ['Solved', 'Partially Solved', 'Needs Revision', 'Stuck'],
    default: 'Solved'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CodingLog', CodingLogSchema);