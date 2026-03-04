const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Get conversations list
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user.id },
            { receiverId: req.user.id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', req.user.id] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    await Message.populate(conversations, {
      path: 'lastMessage.senderId lastMessage.receiverId',
      select: 'name email role company'
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages in a conversation
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
      .populate('senderId receiverId', 'name email role')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiverId: req.user.id,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, message, conversationId, relatedJob, relatedApplication } = req.body;

    const newMessage = new Message({
      conversationId: conversationId || `${req.user.id}_${receiverId}`,
      senderId: req.user.id,
      receiverId,
      message,
      relatedJob,
      relatedApplication
    });

    await newMessage.save();
    await newMessage.populate('senderId receiverId', 'name email role');

    // Emit socket event
    const io = req.app.get('io');
    io.to(receiverId).emit('new_message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user.id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
