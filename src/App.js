

// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import { AuthProvider } from './context/AuthContext';
// // import PrivateRoute from './components/PrivateRoute';
// // import Home from './pages/Home';
// // import Login from './pages/Login';
// // import Register from './pages/Register';
// // import ChatRoom from './pages/ChatRoom';

// // function App() {
// //   return (
// //     <Router>
// //       <AuthProvider>
// //         <div className="min-h-screen bg-gray-100">
// //           <Routes>
// //             <Route path="/login" element={<Login />} />
// //             <Route path="/register" element={<Register />} />
// //             <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
// //             <Route path="/chat/:roomId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
// //           </Routes>
// //         </div>
// //       </AuthProvider>
// //     </Router>
// //   );
// // }

// // export default App;


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
// import PrivateRoute from './components/PrivateRoute';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ChatRoom from './pages/ChatRoom';

// function App() {
//   return (
//     <AuthProvider>
//       <SocketProvider>
//         <Router>
//           <div className="min-h-screen bg-gray-100">
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
//               <Route path="/chat/:roomId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
//             </Routes>
//           </div>
//         </Router>
//       </SocketProvider>
//     </AuthProvider>
//   );
// }

// export default App;

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/chat/:roomId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
