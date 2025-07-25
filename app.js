// require('dotenv').config();
// require('./config/db')
// const cookieParser = require('cookie-parser');
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const authRoutes = require('./routes/auth');
// const charRoutes = require('./routes/chat');
// const {initializeSocket} = require('./utils/socket');


// const app = express();
// const server = http.createServer(app);

// app.use(express.json());
// app.use(cookieParser())
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// }));

// app.use()


// const io = socketIo(server,{
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ["GET", "POST"],
//         credentials: true
//     } 
// });

// initializeSocket(io);


// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

require('dotenv').config({ debug: true });
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { initializeSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
initializeSocket(io);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));