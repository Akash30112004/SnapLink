import { useState } from 'react';
import PropTypes from 'prop-types';
import { MoreVertical, Search, ShieldAlert, ShieldCheck, Trash2, Bell, BellOff, Bot, Users, Star, LogOut } from 'lucide-react';
import Avatar from '../common/Avatar';
import BlockConfirmModal from '../modals/BlockConfirmModal';

const ChatHeader = ({ user, isGroup, onlineUsers, onOpenProfile, onBlockUser, onUnblockUser, onClearChat, onSearchToggle, isFavoriteConversation, onToggleFavoriteConversation, onLeaveGroup, onDeleteGroup, currentUser, isUserBlocked, conversationId, isMuted, onMuteConversation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  
  // Check if user is actually online using the onlineUsers set
  const userId = user?._id || user?.id;
  const isUserOnline = onlineUsers && userId ? onlineUsers.has(userId) : false;
  
  // Check if current user is admin of the group
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAdmin = isGroup && user?.admin && currentUserId && (user.admin === currentUserId || user.admin._id === currentUserId || user.admin.toString() === currentUserId);

  return (
    <div className="h-20 border-b-2 border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl px-6 flex items-center justify-between shadow-sm relative z-40 overflow-visible">
      {/* User/Group Info - Clickable */}
      <button
        type="button"
        onClick={onOpenProfile}
        disabled={user.isBot}
        className={`flex items-center gap-4 text-left flex-1 transition-opacity ${user.isBot ? 'cursor-default opacity-100 hover:opacity-100' : 'hover:opacity-90'}`}
        title={user.isBot ? 'AI Assistant' : isGroup ? 'View group info' : 'View profile'}
      >
        {isGroup ? (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#065F46] flex items-center justify-center shadow-lg ring-2 ring-[#10B981]/30">
            <Users className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <Avatar 
            name={user.name} 
            src={user.avatar}
            online={isUserOnline}
            size="lg"
          />
        )}
        <div>
          <h3 className="text-lg font-bold text-[#D1FAE5] hover:text-[#10B981]">{user.name}</h3>
          <p className="text-sm text-[#D1FAE5]/60 flex items-center gap-2">
            {isGroup ? (
              <>
                <Users className="w-3 h-3" />
                {user.memberCount} members
              </>
            ) : user.isBot ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  AI Assistant
                </span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-[#10B981] animate-pulse' : 'bg-[#D1FAE5]/40'}`}></span>
                {isUserOnline ? 'Active now' : 'Offline'}
              </>
            )}
          </p>
        </div>
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 relative">
        {/* More Options Menu */}
        <div className="relative z-[9999]">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 rounded-xl bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#D1FAE5]/60 hover:text-[#10B981] transition-all duration-200 hover:scale-105"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <div 
                className="fixed inset-0 z-[9998] pointer-events-auto"
                onClick={() => setIsMenuOpen(false)}
              />
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#064E3B]/95 backdrop-blur-xl border-2 border-[#10B981]/20 rounded-2xl shadow-2xl z-[9999] pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onSearchToggle?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-[#10B981]/10 transition-colors first:rounded-t-lg"
              >
                <Search className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-medium">Search in Chat</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleFavoriteConversation?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-[#10B981]/10 transition-colors"
              >
                <Star className={`w-4 h-4 ${isFavoriteConversation ? 'fill-[#10B981] text-[#10B981]' : 'text-[#10B981]'}`} />
                <span className="text-sm font-medium">
                  {isFavoriteConversation ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onMuteConversation?.(conversationId);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-[#10B981]/10 transition-colors"
              >
                {isMuted ? (
                  <BellOff className="w-4 h-4 text-[#D1FAE5]/60" />
                ) : (
                  <Bell className="w-4 h-4 text-[#10B981]" />
                )}
                <span className="text-sm font-medium">
                  {isMuted ? 'Unmute notifications' : 'Mute notifications'}
                </span>
              </button>

              {/* Conditional: Block/Unblock User (only for 1-to-1 chats, not for bots) */}
              {!isGroup && !user.isBot && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowBlockModal(true);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] transition-colors ${
                    isUserBlocked 
                      ? 'hover:bg-[#10B981]/10' 
                      : 'hover:bg-red-500/10'
                  }`}
                >
                  {isUserBlocked ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                      <span className="text-sm font-medium">Unblock User</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium">Block User</span>
                    </>
                  )}
                </button>
              )}

              {/* Conditional: Leave Group (only for groups, non-admin) */}
              {isGroup && !isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLeaveGroup?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Leave Group</span>
                </button>
              )}

              {/* Conditional: Delete Group (only for group admins) */}
              {isGroup && isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDeleteGroup?.(user._id || user.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Delete Group</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onClearChat?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#D1FAE5] hover:bg-red-500/10 transition-colors last:rounded-b-lg"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">Clear Chat</span>
              </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Block Confirmation Modal */}
      <BlockConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={() => {
          if (isUserBlocked) {
            onUnblockUser?.(user._id || user.id);
          } else {
            onBlockUser?.(user._id || user.id);
          }
        }}
        userName={user.name}
        isBlocked={isUserBlocked}
      />
    </div>
  );
};

ChatHeader.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    status: PropTypes.string,
    memberCount: PropTypes.number,
    isBot: PropTypes.bool,
    admin: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  isGroup: PropTypes.bool,
  onlineUsers: PropTypes.instanceOf(Set),
  onOpenProfile: PropTypes.func.isRequired,
  onBlockUser: PropTypes.func,
  onUnblockUser: PropTypes.func,
  onClearChat: PropTypes.func,
  onSearchToggle: PropTypes.func,
  isFavoriteConversation: PropTypes.bool,
  onToggleFavoriteConversation: PropTypes.func,
  onLeaveGroup: PropTypes.func,
  onDeleteGroup: PropTypes.func,
  isUserBlocked: PropTypes.bool,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  conversationId: PropTypes.string,
  isMuted: PropTypes.bool,
  onMuteConversation: PropTypes.func,
};

ChatHeader.defaultProps = {
  isGroup: false,
  onlineUsers: new Set(),
  onBlockUser: null,
  onUnblockUser: null,
  onClearChat: null,
  onSearchToggle: null,
  isFavoriteConversation: false,
  onToggleFavoriteConversation: null,
  onLeaveGroup: null,
  onDeleteGroup: null,
  isUserBlocked: false,
  currentUser: null,
  conversationId: null,
  isMuted: false,
  onMuteConversation: null,
};

export default ChatHeader;
