import PropTypes from 'prop-types';
import { Users } from 'lucide-react';
import { formatDateLabel, getFirstName } from '../../utils/helpers';

const GroupList = ({ groups, selectedGroupId, onSelectGroup }) => {
  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-[#D1FAE5]/20 mx-auto mb-4" />
          <p className="text-[#D1FAE5]/60">No groups yet</p>
          <p className="text-sm text-[#D1FAE5]/40 mt-2">Create a group to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((group) => {
        const isSelected = group._id === selectedGroupId;
        const unreadCount = group.unreadCount || 0;
        const hasLastMessage = Boolean(group.lastMessage && group.lastMessage.trim());
        const isSingleUnread = unreadCount === 1 && hasLastMessage;
        const isMultipleUnread = unreadCount > 1 && hasLastMessage;
        const senderLabel = group.lastMessageSender ? getFirstName(group.lastMessageSender) : 'Someone';
        const messageLabel = group.lastMessage || '';
        
        return (
          <button
            key={group._id}
            type="button"
            onClick={() => onSelectGroup(group)}
            className={`
              w-full px-4 py-4 flex items-center gap-3
              border-b border-[#10B981]/10
              transition-all duration-200 hover:bg-[#10B981]/20
              ${isSelected ? 'bg-[#10B981]/30 border-l-4 border-l-[#10B981]' : ''}
            `}
          >
            {/* Group Avatar/Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#065F46] flex items-center justify-center shadow-lg ring-2 ring-[#10B981]/30">
                <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>

            {/* Group Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold truncate ${isSelected ? 'text-[#D1FAE5]' : 'text-[#D1FAE5]'}`}>
                  {group.name}
                </h3>
                <span className="text-xs text-[#D1FAE5]/60 ml-2 flex-shrink-0">
                  {formatDateLabel(group.lastMessageTime)}
                </span>
              </div>
              
              {isMultipleUnread ? (
                <div className="text-sm text-[#10B981] font-semibold truncate">
                  {unreadCount}+ new messages
                </div>
              ) : hasLastMessage ? (
                <div
                  className={`flex items-center gap-2 text-sm truncate ${
                    isSingleUnread ? 'text-[#D1FAE5] font-semibold' : 'text-[#D1FAE5]/60'
                  }`}
                >
                  <span className="font-medium">{senderLabel}:</span>
                  <span className="truncate">{messageLabel}</span>
                </div>
              ) : (
                <div className="text-sm text-[#D1FAE5]/40">&nbsp;</div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-[#D1FAE5]/40 mt-1">
                <Users className="w-3 h-3" />
                <span>{group.memberCount} members</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

GroupList.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      lastMessage: PropTypes.string,
      lastMessageTime: PropTypes.instanceOf(Date),
      lastMessageSender: PropTypes.string,
      unreadCount: PropTypes.number,
      memberCount: PropTypes.number,
    })
  ).isRequired,
  selectedGroupId: PropTypes.string,
  onSelectGroup: PropTypes.func.isRequired,
};

export default GroupList;
