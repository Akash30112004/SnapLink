// Helper functions for SnapLink

// Format timestamp to readable time
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'Just now';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // This week
  if (diff < 604800000) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format timestamp for list labels (Today/Yesterday/Date)
export const formatDateLabel = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Format: "24 Nov 2025"
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Get first name from full name
export const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  const parts = fullName.trim().split(' ');
  return parts[0] || '';
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password (min 6 characters)
export const validatePassword = (password) => {
  return password.length >= 6;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random color for avatar (matching dark green theme)
export const getRandomColor = (seed) => {
  const colors = [
    'bg-[#10B981]',      // Bright emerald (accent)
    'bg-[#065F46]',      // Medium green
    'bg-[#047857]',      // Deep green
    'bg-[#0D9488]',      // Teal
    'bg-[#06B6D4]',      // Cyan
    'bg-[#187F97]',      // Dark cyan
    'bg-[#059669]',      // Forest green
    'bg-[#0891B2]',      // Cyan accent
    'bg-[#2D7C7F]',      // Dark teal
    'bg-[#0F766E]',      // Slate green
  ];
  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};

// Get initials from name (first letter of first name only)
export const getInitials = (name) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
