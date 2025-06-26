import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        try {
          const userData = await authService.getUserById(currentUserId);
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem('currentUserId');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          localStorage.removeItem('currentUserId');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);

      if (result.success) {
        localStorage.setItem('currentUserId', result.user.id);
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);

      if (result.success) {
        localStorage.setItem('currentUserId', result.user.id);
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
  };

  const isAdmin = () => {
    if (!user) return false;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
    return user.role === 'admin' && user.email.toLowerCase() === adminEmail.toLowerCase();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: isAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
