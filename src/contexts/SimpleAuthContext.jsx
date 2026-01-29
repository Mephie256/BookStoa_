import { createContext, useContext, useState, useEffect } from 'react';

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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/session`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const session = await response.json();
        if (session && session.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${apiUrl}/auth/signin/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // After successful login, fetch the session
        await checkSession();
        return { success: true };
      } else {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Email/Password Registration
  const register = async (userData) => {
    try {
      const registerUrl = 'http://localhost:3001/api/register';
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // After successful registration, automatically log in
        return await login(userData.email, userData.password);
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Could not connect to server. Make sure the backend is running.' };
    }
  };

  // Google Sign In
  const loginWithGoogle = () => {
    window.location.href = `${apiUrl}/auth/signin/google`;
  };

  // Logout
  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => {
    if (!user) return false;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
    return user.role === 'admin' || user.email?.toLowerCase() === adminEmail.toLowerCase();
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAdmin: isAdmin()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
