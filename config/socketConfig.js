const socketio = require('socket.io');
const socketAuth = require('../middleware/socketAuth');
const { 
  handleConnection, 
  handleDisconnect,
  handleMessage,
  handleTyping
} = require('../services/socketService');

const configureSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use(socketAuth);
  
  io.on('connection', (socket) => {
    handleConnection(io, socket);
    
    socket.on('disconnect', () => handleDisconnect(io, socket));
    socket.on('sendMessage', (data) => handleMessage(io, socket, data));
    socket.on('typing', (data) => handleTyping(io, socket, data));
    
    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  return io;
};

module.exports = configureSocket;