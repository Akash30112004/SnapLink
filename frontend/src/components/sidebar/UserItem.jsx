import PropTypes from 'prop-types';
import { useState } from 'react';
import Avatar from '../common/Avatar';
import ImagePreviewModal from '../common/ImagePreviewModal';
import { formatDateLabel } from '../../utils/helpers';

const UserItem = ({ user, isOnline = false, isSelected, onClick, showPreview, compactMode }) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const unreadCount = user.unreadCount || 0;
  const hasLastMessage = Boolean(user.lastMessage && user.lastMessage.trim());
  const isSingleUnread = unreadCount === 1 && hasLastMessage;
  const isMultipleUnread = unreadCount > 1;
  const hasUnread = unreadCount > 0 && hasLastMessage;
  
  let previewText;
  if (isMultipleUnread && hasLastMessage) {
    previewText = `${unreadCount}+ new messages`;
  } else if (isSingleUnread) {
    previewText = user.lastMessage;
  } else if (showPreview && hasLastMessage) {
    previewText = user.lastMessage;
  } else {
    previewText = '';
  }

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (user.avatar) {
      setShowImagePreview(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 ${compactMode ? 'p-3' : 'p-4'} rounded-2xl cursor-pointer
        transition-all duration-200
        ${isSelected 
          ? 'bg-linear-to-r from-[#10B981] to-[#065F46] text-white shadow-lg shadow-[#10B981]/20' 
          : 'hover:bg-[#10B981]/10 text-[#D1FAE5]'
        }
      `}
    >
      {/* Avatar */}
      <button
        type="button"
        onClick={handleAvatarClick}
        className="relative shrink-0 rounded-full hover:opacity-80 transition-opacity active:scale-95"
      >
        <Avatar 
          name={user.name}
          src={user.avatar}
          online={isOnline}
          size="md"
        />
      </button>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-[#D1FAE5]'}`}>
            {user.name}
          </h4>
          <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#D1FAE5]/60'}`}>
            {formatDateLabel(user.lastMessageTime)}
          </span>
        </div>
        <p
          className={`text-sm truncate ${
            isSelected
              ? 'text-white/90'
              : isSingleUnread
                ? 'text-[#D1FAE5] font-semibold'
                : isMultipleUnread
                  ? 'text-[#10B981] font-semibold'
                  : 'text-[#D1FAE5]/60'
          }`}
        >
          {previewText}
        </p>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && user.avatar && (
        <ImagePreviewModal
          imageUrl={user.avatar}
          userName={user.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </div>
  );
};

UserItem.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    lastMessage: PropTypes.string,
    lastMessageTime: PropTypes.instanceOf(Date),
    unreadCount: PropTypes.number,
  }).isRequired,
  isOnline: PropTypes.bool,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  showPreview: PropTypes.bool.isRequired,
  compactMode: PropTypes.bool.isRequired,
};

export default UserItem;
