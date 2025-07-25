import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get('/api/chat/rooms', { withCredentials: true });
        setRooms(res.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/auth/users', { withCredentials: true });
        setUsers(res.data.filter(u => u._id !== user.id));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchRooms();
    fetchUsers();
  }, [user]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/chat/rooms', {
        name: newRoomName,
        isPrivate,
        participants: isPrivate ? selectedUsers : []
      }, { withCredentials: true });
      
      setRooms([...rooms, res.data]);
      setNewRoomName('');
      setIsPrivate(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">Chat App</h1>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Online Users ({onlineUsers.length})</h2>
          <ul>
            {onlineUsers.map(userId => (
              <li key={userId} className="flex items-center py-1">
                <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                {users.find(u => u._id === userId)?.username || 'User'}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="mb-2 text-lg font-semibold">Chat Rooms</h2>
          <ul>
            {rooms.map(room => (
              <li key={room._id} className="py-1">
                <Link 
                  to={`/chat/${room._id}`}
                  className="block px-2 py-1 rounded hover:bg-gray-700"
                >
                  {room.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Create Room</h2>
          <form onSubmit={handleCreateRoom}>
            <input
              type="text"
              placeholder="Room name"
              className="w-full px-3 py-2 mb-2 text-gray-800 rounded"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
            />
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              Private Room
            </label>
            {isPrivate && (
              <div className="mb-2">
                <h3 className="mb-1 text-sm font-medium">Select Participants</h3>
                {users.map(user => (
                  <label key={user._id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                    />
                    {user.username}
                  </label>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="w-full px-3 py-2 mt-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Create Room
            </button>
          </form>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
            <p className="mt-2 text-gray-600">Select a chat room to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;