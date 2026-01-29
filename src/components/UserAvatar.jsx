import { useMemo } from 'react';

/**
 * UserAvatar Component
 * Generates a colored avatar with the first letter of the user's name
 * Similar to WhatsApp's avatar style
 */
const UserAvatar = ({ user, size = 'md', className = '' }) => {
  // Generate consistent color based on user's name or email
  const avatarColor = useMemo(() => {
    const colors = [
      { bg: '#FF6B6B', text: '#FFFFFF' }, // Red
      { bg: '#4ECDC4', text: '#FFFFFF' }, // Teal
      { bg: '#45B7D1', text: '#FFFFFF' }, // Blue
      { bg: '#FFA07A', text: '#FFFFFF' }, // Light Salmon
      { bg: '#98D8C8', text: '#FFFFFF' }, // Mint
      { bg: '#F7DC6F', text: '#2C3E50' }, // Yellow
      { bg: '#BB8FCE', text: '#FFFFFF' }, // Purple
      { bg: '#85C1E2', text: '#FFFFFF' }, // Sky Blue
      { bg: '#F8B739', text: '#FFFFFF' }, // Orange
      { bg: '#52B788', text: '#FFFFFF' }, // Green
      { bg: '#E63946', text: '#FFFFFF' }, // Crimson
      { bg: '#457B9D', text: '#FFFFFF' }, // Steel Blue
      { bg: '#E76F51', text: '#FFFFFF' }, // Burnt Sienna
      { bg: '#2A9D8F', text: '#FFFFFF' }, // Persian Green
      { bg: '#264653', text: '#FFFFFF' }, // Charcoal
      { bg: '#E9C46A', text: '#2C3E50' }, // Sandy Brown
      { bg: '#F4A261', text: '#FFFFFF' }, // Sandy Orange
      { bg: '#8338EC', text: '#FFFFFF' }, // Violet
      { bg: '#3A86FF', text: '#FFFFFF' }, // Dodger Blue
      { bg: '#FB5607', text: '#FFFFFF' }, // Orange Red
    ];

    // Use name or email to generate consistent color
    const identifier = user?.name || user?.email || 'User';
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }, [user]);

  // Get first letter of name or email
  const getInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Size variants
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold shadow-md ${className}`}
      style={{
        backgroundColor: avatarColor.bg,
        color: avatarColor.text,
      }}
    >
      {getInitial()}
    </div>
  );
};

export default UserAvatar;
