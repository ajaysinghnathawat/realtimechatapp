
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/me`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        { username, email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      setUser(response.data.user);
      navigate('/');
      return response.data;
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      setUser(response.data.user);
      navigate('/');
      return response.data;
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

