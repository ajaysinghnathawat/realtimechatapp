// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';

// const Register = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register(username, email, password);
//       navigate('/');
//     } catch (err) {
//       setError(err);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
//         <h2 className="text-2xl font-bold text-center">Register</h2>
//         {error && <div className="p-2 text-red-500 bg-red-100 rounded">{error}</div>}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               id="username"
//               type="text"
//               required
//               className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               required
//               className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               required
//               className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>
//           <div>
//             <button
//               type="submit"
//               className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               Register
//             </button>
//           </div>
//         </form>
//         <div className="text-sm text-center">
//           Already have an account?{' '}
//           <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//             Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;