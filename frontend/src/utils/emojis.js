// Common emoji reactions for messages
export const EMOJI_REACTIONS = [
  { emoji: '👍', label: 'Like', category: 'hand' },
  { emoji: '❤️', label: 'Love', category: 'emotion' },
  { emoji: '😂', label: 'Haha', category: 'emotion' },
  { emoji: '😮', label: 'Wow', category: 'emotion' },
  { emoji: '😢', label: 'Sad', category: 'emotion' },
  { emoji: '😡', label: 'Angry', category: 'emotion' },
  { emoji: '🔥', label: 'Fire', category: 'nature' },
  { emoji: '🎉', label: 'Party', category: 'celebration' },
  { emoji: '✨', label: 'Sparkles', category: 'celebration' },
  { emoji: '💯', label: 'Perfect', category: 'hand' },
  { emoji: '🚀', label: 'Rocket', category: 'objects' },
  { emoji: '😍', label: 'Love Eyes', category: 'emotion' },
];

// Emoji categories for picker
export const EMOJI_CATEGORIES = {
  smileys: '😄',
  animals: '🐶',
  food: '🍔',
  travel: '✈️',
  activities: '⚽',
  objects: '💡',
  symbols: '❤️',
};

// Utility function to check if emoji exists in reactions array
export const hasReaction = (reactions = [], emoji) => {
  return reactions.some(r => r.emoji === emoji);
};

// Utility function to get reaction count
export const getReactionCount = (reactions = [], emoji) => {
  const reaction = reactions.find(r => r.emoji === emoji);
  return reaction ? reaction.users.length : 0;
};

// Utility function to check if current user has reacted with emoji
export const hasUserReacted = (reactions = [], emoji, userId) => {
  const reaction = reactions.find(r => r.emoji === emoji);
  return reaction ? reaction.users.includes(userId) : false;
};

// Format emoji reaction data
export const formatReactionData = (emoji, userId) => {
  return {
    emoji,
    users: [userId],
    count: 1,
  };
};

export default {
  EMOJI_REACTIONS,
  EMOJI_CATEGORIES,
  hasReaction,
  getReactionCount,
  hasUserReacted,
  formatReactionData,
};
