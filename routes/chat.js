const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Room = require('../models/Room');
const Message = require('../models/Message');

// Create a room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { name, isPrivate, participants } = req.body;
    
    const room = new Room({
      name,
      isPrivate,
      participants: isPrivate ? participants : [],
      createdBy: req.user.id
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get all rooms
router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { isPrivate: false },
        { participants: req.user.id }
      ]
    }).populate('participants', 'username');
    
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Get room messages
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;