import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [room, setRoom] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRoomAndMessages = async () => {
      try {
        const [roomRes, messagesRes] = await Promise.all([
          axios.get(`/api/chat/rooms/${roomId}`, { withCredentials: true }),
          axios.get(`/api/chat/rooms/${roomId}/messages`, { withCredentials: true })
        ]);
        
        setRoom(roomRes.data);
        setMessages(messagesRes.data);
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    fetchRoomAndMessages();

    if (socket) {
      socket.emit('joinRoom', roomId);

      socket.on('newMessage', (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });

      socket.on('typing', ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!isTyping) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });
      });
    }

    return () => {
      if (socket) {
        socket.emit('leaveRoom', roomId);
        socket.off('newMessage');
        socket.off('typing');
      }
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('sendMessage', {
        roomId,
        content: message
      });
      setMessage('');
      setIsTyping(false);
      socket.emit('typing', { roomId, isTyping: false });
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { roomId, isTyping: true });
    }
    
    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timerLength && isTyping) {
        setIsTyping(false);
        socket.emit('typing', { roomId, isTyping: false });
      }
    }, timerLength);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">{room?.name || 'Loading...'}</h2>
          <p className="text-sm text-gray-400">
            {room?.isPrivate ? 'Private Room' : 'Public Room'}
          </p>
        </div>
        
        <div>
          <h3 className="mb-2 text-lg font-semibold">Participants</h3>
          <ul>
            {room?.participants?.map(participant => (
              <li key={participant._id} className="py-1">
                <div className="flex items-center">
                  <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                  {participant.username}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {messages.map(msg => (
            <div 
              key={msg._id} 
              className={`mb-4 ${msg.sender._id === user.id ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block px-4 py-2 rounded-lg ${msg.sender._id === user.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'}`}
              >
                <div className="text-sm font-semibold">
                  {msg.sender._id === user.id ? 'You' : msg.sender.username}
                </div>
                <div>{msg.content}</div>
                <div className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="mb-2 text-sm text-gray-500">
              {typingUsers.length === 1 
                ? `${typingUsers[0] === user.id ? 'You are' : 'Someone is'} typing...`
                : 'Several people are typing...'}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage}>
            <div className="flex">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;


// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSocket } from '../context/SocketContext';
// import { useAuth } from '../context/AuthContext';

// const ChatRoom = () => {
//   const { roomId } = useParams();
//   const { socket } = useSocket(); // Now properly destructured
//   const { user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     if (!socket) return;

//     // Join room when component mounts
//     socket.emit('joinRoom', roomId);

//     // Listen for new messages
//     socket.on('newMessage', (newMessage) => {
//       setMessages(prev => [...prev, newMessage]);
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.off('newMessage');
//       socket.emit('leaveRoom', roomId);
//     };
//   }, [socket, roomId]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (message.trim() && socket) {
//       socket.emit('sendMessage', {
//         roomId,
//         content: message,
//         sender: user.id
//       });
//       setMessage('');
//     }
//   };

//   if (!socket) {
//     return <div className="p-4 text-center">Connecting to chat server...</div>;
//   }

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="flex-1 overflow-y-auto p-4">
//         {messages.map((msg, index) => (
//           <div key={index} className="mb-2">
//             <div className={`p-2 rounded-lg ${msg.sender === user.id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 mr-auto'}`}>
//               {msg.content}
//             </div>
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleSendMessage} className="p-4 border-t">
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           className="w-full p-2 border rounded"
//           placeholder="Type a message..."
//         />
//         <button 
//           type="submit" 
//           className="mt-2 w-full bg-blue-500 text-white py-2 rounded"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatRoom;