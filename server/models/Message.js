const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  relatedJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }
}, {
  timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
