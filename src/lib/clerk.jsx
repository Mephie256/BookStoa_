import { ClerkProvider, useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { createContext, useContext, useEffect, useState } from 'react';

// Get the publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// User context for database user data
const UserContext = createContext();

export const useUserData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserData must be used within UserProvider');
  }
  return context;
};

// User provider that syncs Clerk user with database
export const UserProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) return;

      if (user) {
        try {
          // For now, create a simple user object from Clerk data
          // In production, you'd sync with your backend API
          const userData = {
            id: user.id,
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: user.fullName || user.firstName || 'User',
            role: user.emailAddresses[0]?.emailAddress?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com').toLowerCase() ? 'admin' : 'user',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          setDbUser(userData);
        } catch (error) {
          console.error('Error creating user data:', error);
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    };

    syncUser();
  }, [user, isLoaded]);

  const isAdmin = () => {
    if (!dbUser) return false;
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
    return dbUser.role === 'admin' && dbUser.email.toLowerCase() === adminEmail.toLowerCase();
  };

  const value = {
    user: dbUser,
    clerkUser: user,
    loading,
    isAdmin: isAdmin(),
    refetchUser: async () => {
      // For now, just recreate user data from Clerk
      if (user) {
        const userData = {
          id: user.id,
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || user.firstName || 'User',
          role: user.emailAddresses[0]?.emailAddress?.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com').toLowerCase() ? 'admin' : 'user',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDbUser(userData);
      }
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Main Clerk provider wrapper
export const ClerkProviderWrapper = ({ children }) => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <UserProvider>
        {children}
      </UserProvider>
    </ClerkProvider>
  );
};

export { useUser, useAuth } from '@clerk/clerk-react';
