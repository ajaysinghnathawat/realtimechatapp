const onlineUsers = new Map();

const handleConnection = (io, socket) => {
  console.log(`User connected: ${socket.user.id}`);
  onlineUsers.set(socket.user.id, socket.id);
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));
};

const handleDisconnect = (io, socket) => {
  console.log(`User disconnected: ${socket.user.id}`);
  onlineUsers.delete(socket.user.id);
  io.emit('onlineUsers', Array.from(onlineUsers.keys()));
};

const handleMessage = async (io, socket, { roomId, content }) => {
  try {
    const message = new Message({
      content,
      room: roomId,
      sender: socket.user.id
    });
    
    await message.save();
    const populatedMessage = await message.populate('sender', 'username');
    
    io.to(roomId).emit('newMessage', populatedMessage);
  } catch (err) {
    console.error('Error handling message:', err);
    socket.emit('error', 'Failed to send message');
  }
};

const handleTyping = (io, socket, { roomId, isTyping }) => {
  socket.to(roomId).emit('typing', {
    userId: socket.user.id,
    isTyping
  });
};

module.exports = {
  handleConnection,
  handleDisconnect,
  handleMessage,
  handleTyping
};