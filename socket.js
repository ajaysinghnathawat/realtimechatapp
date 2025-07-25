const initializeSocket = (io) => {
  const onlineUsers = new Map();
  
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.userId);
    
    // Add user to online list
    onlineUsers.set(socket.userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    
    // Join room
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });
    
    // Leave room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });
    
    // Send message
    socket.on('sendMessage', async ({ roomId, content }) => {
      try {
        const message = new Message({
          content,
          room: roomId,
          sender: socket.userId
        });
        
        await message.save();
        
        const populatedMessage = await Message.populate(message, {
          path: 'sender',
          select: 'username'
        });
        
        io.to(roomId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });
    
    // Typing indicator
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing', {
        userId: socket.userId,
        isTyping
      });
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.userId);
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = { initializeSocket };