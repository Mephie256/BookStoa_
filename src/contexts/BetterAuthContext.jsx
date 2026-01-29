import { createContext, useContext, useState, useEffect } from 'react';
import { createAuthClient } from 'better-auth/react';
import { customSessionClient, inferAdditionalFields } from 'better-auth/client/plugins';

// Create better-auth client
// Create better-auth client
const authClient = createAuthClient({
    baseURL: window.location.origin,
    plugins: [
      customSessionClient(),
      inferAdditionalFields({
        user: {
          role: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      }),
    ],
});

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { data: sessionData, isPending } = authClient.useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(sessionData?.user || null);
    setLoading(isPending);
  }, [sessionData, isPending]);

  const checkSession = async () => {
    try {
      const session = await authClient.getSession();
      setUser(session?.user || null);
      return session;
    } catch (error) {
      console.error('Failed to check session:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Registration with admin check
  const register = async ({ email, password, name }) => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
      const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/',
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Registration failed',
        };
      }

      // Update user role if admin
      if (role === 'admin' && result.data) {
        // Note: better-auth doesn't support custom fields during signup out of the box
        // We'll need to update the role via API after registration
        // For now, we'll handle this in the backend
      }

      await checkSession();
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  // Email/Password Login
  const login = async (email, password) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/',
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Invalid email or password',
        };
      }

      await checkSession();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUser(null);
          },
        },
      });
      setUser(null);
      await checkSession();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  };

  // Check if user is admin
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
    logout,
    isAdmin: isAdmin(),
    checkSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
