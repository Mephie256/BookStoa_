import { useUser, useAuth, useClerk } from '@clerk/clerk-react';

const ClerkDebug = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const clerk = useClerk();

  console.log('🔍 Clerk Debug Info:', {
    userLoaded,
    authLoaded,
    isSignedIn,
    user: user ? {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      name: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName
    } : null,
    clerkLoaded: !!clerk
  });

  if (!userLoaded || !authLoaded) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-600 text-white p-3 rounded-lg z-50">
        🔄 Loading Clerk...
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-3 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔍 Clerk Debug</h3>
      <div className="text-xs space-y-1">
        <div>Signed In: {isSignedIn ? '✅' : '❌'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.emailAddresses?.[0]?.emailAddress || 'None'}</div>
        <div>Name: {user?.fullName || 'None'}</div>
        <div>Clerk Loaded: {clerk ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default ClerkDebug;
