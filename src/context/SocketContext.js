// // // import { createContext, useContext, useEffect, useState } from 'react';
// // // import { io } from 'socket.io-client';
// // // import { useAuth } from './AuthContext';

// // // const SocketContext = createContext();

// // // export const SocketProvider = ({ children }) => {
// // //   const [socket, setSocket] = useState(null);
// // //   const [onlineUsers, setOnlineUsers] = useState([]);
// // //   const { user } = useAuth();

// // //   useEffect(() => {
// // //     if (user) {
// // //       const newSocket = io('http://localhost:5000', {
// // //         withCredentials: true,
// // //         auth: {
// // //           token: document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
// // //         }
// // //       });

// // //       setSocket(newSocket);

// // //       newSocket.on('onlineUsers', (users) => {
// // //         setOnlineUsers(users);
// // //       });

// // //       return () => {
// // //         newSocket.disconnect();
// // //       };
// // //     }
// // //   }, [user]);

// // //   return (
// // //     <SocketContext.Provider value={{ socket, onlineUsers }}>
// // //       {children}
// // //     </SocketContext.Provider>
// // //   );
// // // };

// // // export const useSocket = () => useContext(SocketContext);

// // import { createContext, useContext, useEffect, useState } from 'react';
// // import { io } from 'socket.io-client';
// // import { useAuth } from './AuthContext';

// // const SocketContext = createContext(null);

// // export const SocketProvider = ({ children }) => {
// //   const [socket, setSocket] = useState(null);
// //   const { user } = useAuth();

// //   useEffect(() => {
// //     if (!user) {
// //       // No user = no socket connection needed
// //       if (socket) {
// //         socket.disconnect();
// //         setSocket(null);
// //       }
// //       return;
// //     }

// //     // Initialize new socket connection
// //     const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
// //       withCredentials: true,
// //       auth: {
// //         token: document.cookie.split('; ')
// //           .find(row => row.startsWith('token='))
// //           ?.split('=')[1]
// //       },
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000,
// //       autoConnect: true
// //     });

// //     // Connection events
// //     newSocket.on('connect', () => {
// //       console.log('Socket connected');
// //     });

// //     newSocket.on('disconnect', () => {
// //       console.log('Socket disconnected');
// //     });

// //     newSocket.on('connect_error', (err) => {
// //       console.error('Socket connection error:', err);
// //     });

// //     setSocket(newSocket);

// //     // Cleanup on unmount
// //     return () => {
// //       newSocket.off('connect');
// //       newSocket.off('disconnect');
// //       newSocket.off('connect_error');
// //       newSocket.disconnect();
// //     };
// //   }, [user]); // Re-run effect when user changes

// //   return (
// //     <SocketContext.Provider value={{ socket }}>
// //       {children}
// //     </SocketContext.Provider>
// //   );
// // };

// // export const useSocket = () => {
// //   const context = useContext(SocketContext);
// //   if (context === undefined) {
// //     throw new Error('useSocket must be used within a SocketProvider');
// //   }
// //   return context;
// // };

// import { createContext, useContext, useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import { useAuth } from './AuthContext';

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const { user } = useAuth();

//   useEffect(() => {
//     if (!user) {
//       if (socket) {
//         socket.disconnect();
//         setSocket(null);
//       }
//       return;
//     }

//     const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
//       withCredentials: true,
//       auth: { token: document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] }
//     });

//     newSocket.on('connect', () => {
//       console.log('Socket connected');
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [user]);

//   return (
//     <SocketContext.Provider value={{ socket }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within SocketProvider');
//   }
//   return context;
// };

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext'; // Optional for notifications

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { user } = useAuth();
  const toast = useToast(); // Optional for showing connection status

  // Get token from cookies safely
  const getAuthToken = useCallback(() => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!user) return null;

    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: { token: getAuthToken() },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      forceNew: true,
      timeout: 20000
    });

    // Connection events
    socketInstance.on('connect', () => {
      setConnectionStatus('connected');
      toast?.success('Real-time connection established');
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, need to reconnect manually
        setTimeout(() => socketInstance.connect(), 1000);
      }
    });

    socketInstance.on('connect_error', (err) => {
      setConnectionStatus('error');
      console.error('Socket connection error:', err.message);
      toast?.error('Connection error. Trying to reconnect...');
    });

    socketInstance.on('reconnect', (attempt) => {
      setConnectionStatus('connected');
      console.log(`Reconnected after ${attempt} attempts`);
      toast?.success('Reconnected successfully');
    });

    socketInstance.on('reconnect_attempt', (attempt) => {
      setConnectionStatus('connecting');
      console.log(`Reconnection attempt ${attempt}`);
    });

    socketInstance.on('reconnect_error', (err) => {
      setConnectionStatus('error');
      console.error('Reconnection error:', err.message);
    });

    socketInstance.on('reconnect_failed', () => {
      setConnectionStatus('failed');
      console.error('Reconnection failed');
      toast?.error('Failed to reconnect. Please refresh the page.');
    });

    return socketInstance;
  }, [user, getAuthToken, toast]);

  // Effect to manage socket lifecycle
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnectionStatus('disconnected');
      }
      return;
    }

    const newSocket = initializeSocket();
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.off('reconnect');
        newSocket.off('reconnect_attempt');
        newSocket.off('reconnect_error');
        newSocket.off('reconnect_failed');
        newSocket.disconnect();
      }
    };
  }, [user, initializeSocket]);

  // Optional: Expose connection status to components
  const value = {
    socket,
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};