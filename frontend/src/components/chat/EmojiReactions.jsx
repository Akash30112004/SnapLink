import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

const EmojiReactions = ({ reactions = [], onAddReaction, onRemoveReaction, currentUserId, messageId }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const pickerRef = useRef(null);
  const containerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const hasReactions = reactions && reactions.length > 0;

  const handleEmojiSelect = (emoji) => {
    onAddReaction?.({ messageId, emoji });
    setShowPicker(false);
  };

  const handleReactionClick = (reaction) => {
    const hasUserReacted = reaction.users?.includes(currentUserId);
    if (hasUserReacted) {
      onRemoveReaction?.({ messageId, emoji: reaction.emoji });
    } else {
      onAddReaction?.({ messageId, emoji: reaction.emoji });
    }
  };

  // Only render if there are reactions
  if (!hasReactions) {
    return null;
  }

  // Sort reactions: current user's reaction first (if exists), then others
  const sortedReactions = reactions.slice().sort((a, b) => {
    const aHasUser = a.users?.includes(currentUserId);
    const bHasUser = b.users?.includes(currentUserId);
    if (aHasUser && !bHasUser) return -1;
    if (!aHasUser && bHasUser) return 1;
    return 0;
  });

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap gap-1 items-center mt-2 relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Display existing reactions - max 2 per message (current user + 1 other) */}
      {sortedReactions.slice(0, 2).map((reaction) => {
        const count = reaction.users?.length || 0;
        const hasUserReacted = reaction.users?.includes(currentUserId);
        
        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => handleReactionClick(reaction)}
            className={`
              px-2.5 py-1 rounded-full text-sm font-medium transition-all duration-200
              cursor-pointer select-none
              ${hasUserReacted 
                ? 'bg-[#10B981]/30 border-2 border-[#10B981]/60 text-white hover:bg-[#10B981]/40 shadow-sm shadow-[#10B981]/20' 
                : 'bg-[#064E3B]/30 border border-[#10B981]/20 text-[#D1FAE5] hover:bg-[#10B981]/20 hover:border-[#10B981]/40'
              }
              hover:scale-110 active:scale-95
            `}
            title={hasUserReacted ? 'Remove reaction' : 'Add reaction'}
          >
            <span className="mr-1.5">{reaction.emoji}</span>
            <span className={`text-xs ${hasUserReacted ? 'font-semibold' : 'font-medium'}`}>{count}</span>
          </button>
        );
      })}

      {/* Show indicator if more reactions exist */}
      {reactions.length > 2 && (
        <span className="text-xs text-[#D1FAE5]/60 px-2">+{reactions.length - 2}</span>
      )}

      {/* Add reaction button - show only on hover */}
      {isHovering && (
        <div ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="p-1.5 rounded-full text-sm transition-all duration-200 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30 hover:scale-110 active:scale-95"
            title="Add emoji reaction"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              position="top"
            />
          )}
        </div>
      )}


    </div>
  );
};

EmojiReactions.propTypes = {
  reactions: PropTypes.arrayOf(
    PropTypes.shape({
      emoji: PropTypes.string.isRequired,
      users: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  onAddReaction: PropTypes.func,
  onRemoveReaction: PropTypes.func,
  currentUserId: PropTypes.string,
  messageId: PropTypes.string.isRequired,
};

EmojiReactions.defaultProps = {
  reactions: [],
  onAddReaction: null,
  onRemoveReaction: null,
  currentUserId: null,
};

export default EmojiReactions;
