import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import MessageInput from './MessageInput';
import BlockedBanner from './BlockedBanner';
import BlockedByBanner from './BlockedByBanner';
import TypingIndicator from '../common/TypingIndicator';
import UserProfilePanel from './UserProfilePanel';
import GroupProfilePanel from './GroupProfilePanel';
import socketService from '../../services/socketService';
import { formatDateLabel } from '../../utils/helpers';

const ChatWindow = ({
  currentConversation,
  selectedUser,
  selectedGroup,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  onlineUsers,
  onOpenProfile,
  onCloseProfile,
  isProfileOpen,
  currentUser,
  compactMode,
  onDeleteMessage,
  onBlockUser,
  onUnblockUser,
  onClearChat,
  onOpenChatbot,
  onFavoriteToggle,
  onGroupFavoriteToggle,
  onLeaveGroup,
  allUsers,
  onDeleteGroup,
  onGroupUpdate,
  uploadProgress,
  isUploading,
  blockStatus,
  isMuted,
  onMuteConversation,
}) => {
  const [localTyping, setLocalTyping] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageRefs = useRef({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isSearchOpen) {
      scrollToBottom();
    }
  }, [messages, isSearchOpen]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setCurrentResultIndex(0);
      return;
    }

    const results = [];
    messages.forEach((msg, index) => {
      if (msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ messageId: msg._id || msg.id, index });
      }
    });

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  // Scroll to current search result
  useEffect(() => {
    if (searchResults.length > 0 && currentResultIndex >= 0) {
      const result = searchResults[currentResultIndex];
      const messageElement = messageRefs.current[result.messageId];
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentResultIndex, searchResults]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setCurrentResultIndex(0);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
    }
  };

  const handlePrevResult = () => {
    if (searchResults.length > 0) {
      setCurrentResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  const handleInputChange = (text) => {
    if (!localTyping && text.length > 0) {
      setLocalTyping(true);
      if (onTyping) onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setLocalTyping(false);
        if (onTyping) onTyping(false);
      }, 2000);
    } else {
      setLocalTyping(false);
      if (onTyping) onTyping(false);
    }
  };

  const handleSendMessage = (text, attachments = []) => {
    // Stop typing indicator when message is sent
    setLocalTyping(false);
    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (onSendMessage) {
      onSendMessage(text, attachments);
    }
  };

  const handleAddReaction = async ({ messageId, emoji }) => {
    try {
      const { chatAPI } = await import('../../services/api');
      const response = await chatAPI.addReaction(messageId, emoji);
      
      // Emit Socket.IO event for real-time updates
      if (currentConversation?._id) {
        socketService.emitAddReaction({
          messageId,
          conversationId: currentConversation._id,
          emoji,
          userId: currentUser?._id || currentUser?.id,
        });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleRemoveReaction = async ({ messageId, emoji }) => {
    try {
      const { chatAPI } = await import('../../services/api');
      const response = await chatAPI.removeReaction(messageId, emoji);
      
      // Emit Socket.IO event for real-time updates
      if (currentConversation?._id) {
        socketService.emitRemoveReaction({
          messageId,
          conversationId: currentConversation._id,
          emoji,
          userId: currentUser?._id || currentUser?.id,
        });
      }
      
      return response;
    } catch (error) {
      console.error('Failed to remove reaction:', error);
    }
  };

  // Check if anyone is typing (exclude current user)
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAnyoneTyping = currentUserId && typingUsers && Object.keys(typingUsers).some(
    userId => userId !== currentUserId && typingUsers[userId]
  );

  if (!selectedUser && !selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#022C22] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-full blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-br from-[#064E3B] to-[#10B981] rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-[#10B981] to-[#065F46] rounded-3xl shadow-2xl shadow-[#10B981]/20 mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#D1FAE5] mb-2">Select a conversation</h3>
          <p className="text-[#D1FAE5]/60 max-w-sm">
            Choose a contact or group from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (isProfileOpen) {
    return (
      <div className="flex-1 flex flex-col bg-[#022C22]">
        {selectedGroup ? (
          <GroupProfilePanel 
            group={selectedGroup} 
            allUsers={allUsers}
            onClose={onCloseProfile} 
            onFavoriteToggle={onGroupFavoriteToggle}
            onlineUsers={onlineUsers}
            onDeleteGroup={onDeleteGroup}
            onGroupUpdate={onGroupUpdate}
          />
        ) : (
          <UserProfilePanel 
            user={selectedUser} 
            onClose={onCloseProfile} 
            onFavoriteToggle={onFavoriteToggle}
            onlineUsers={onlineUsers}
          />
        )}
      </div>
    );
  }

  const messageAreaClasses = compactMode
    ? 'flex-1 overflow-y-auto px-4 py-4 space-y-0.5 relative z-0'
    : 'flex-1 overflow-y-auto px-6 py-6 space-y-1 relative z-0';

  // Determine the chat contact (user or group)
  const chatContact = selectedGroup || selectedUser;
  const isGroupChat = !!selectedGroup;

  return (
    <div className="flex-1 flex flex-col bg-[#022C22] relative">
      {/* Chat Header */}
      <div className="relative z-40">
        <ChatHeader 
          user={chatContact} 
          isGroup={isGroupChat}
          onlineUsers={onlineUsers}
          onOpenProfile={onOpenProfile}
          onBlockUser={onBlockUser}
          onUnblockUser={onUnblockUser}
          onClearChat={onClearChat}
          onSearchToggle={handleSearchToggle}
          isFavoriteConversation={selectedUser?.isFavorite || selectedGroup?.isFavorite || false}
          onToggleFavoriteConversation={() => {
            if (selectedUser && !isGroupChat) {
              onFavoriteToggle?.(selectedUser._id || selectedUser.id, !selectedUser.isFavorite);
            }
          }}
          onLeaveGroup={onLeaveGroup}
          onDeleteGroup={onDeleteGroup}
          currentUser={currentUser}
          isUserBlocked={blockStatus?.hasBlockedThem || blockStatus?.isBlockedByThem || false}
          conversationId={currentConversation?._id}
          isMuted={isMuted}
          onMuteConversation={onMuteConversation}
        />
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="bg-[#064E3B]/60 backdrop-blur-xl border-b border-[#10B981]/20 px-6 py-3 flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in conversation..."
              className="w-full bg-[#022C22]/60 text-[#D1FAE5] placeholder-[#D1FAE5]/40 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 border border-[#10B981]/20"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D1FAE5]/60 hover:text-[#D1FAE5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#D1FAE5]/80 font-medium whitespace-nowrap">
                {currentResultIndex + 1} / {searchResults.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevResult}
                  className="p-2 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#D1FAE5] transition-colors"
                  title="Previous result"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextResult}
                  className="p-2 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#D1FAE5] transition-colors"
                  title="Next result"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleSearchToggle}
            className="p-2 rounded-lg hover:bg-[#10B981]/10 text-[#D1FAE5]/60 hover:text-[#D1FAE5] transition-colors"
            title="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className={messageAreaClasses + ' pointer-events-none'}>
        <div className="pointer-events-auto">
          {/* Messages with Date Separators */}
          {(() => {
            // Sort messages chronologically
            const sortedMessages = [...messages].sort((a, b) => {
              const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
              const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
              return timeA - timeB;
            });
            
            return sortedMessages.map((msg, index) => {
              // Get current user ID
              const currentUserId = currentUser?._id || currentUser?.id;
              
              // Get message sender ID - handle both object and string formats
              let msgSenderId = null;
              if (typeof msg.sender === 'object' && msg.sender?._id) {
                msgSenderId = msg.sender._id;
              } else if (typeof msg.sender === 'string') {
                msgSenderId = msg.sender;
              } else if (msg.senderId) {
                msgSenderId = msg.senderId;
              }
              
              // Check if this message was sent by current user
              const isOwn = msgSenderId === currentUserId;
              
              // Debug logging
              if (msg.text && (msg.text.length < 50)) {
                console.log(`💬 Message "${msg.text}":`, {
                  msgSenderId,
                  currentUserId,
                  isOwn,
                  senderType: typeof msg.sender,
                  sender: msg.sender
                });
              }
              
              const resolvedSenderName = msg.sender?.name || msg.senderName || 'Unknown';
              const resolvedSenderAvatar = msg.sender?.avatar || '';

              const messageId = msg._id || msg.id;
              const isCurrentResult = searchResults.length > 0 && 
                searchResults[currentResultIndex]?.messageId === messageId;
              
              // Find the last message sent by current user
              let isLastOwnMessage = false;
              if (isOwn) {
                // Check if there's any other message from current user after this one in the sorted array
                const hasLaterOwnMessage = sortedMessages.slice(index + 1).some(m => {
                  const laterSenderId = m.sender?._id || m.sender || m.senderId;
                  return laterSenderId === currentUserId;
                });
                isLastOwnMessage = !hasLaterOwnMessage;
              }

              // Check if we need to show date separator
              const showDateSeparator = index === 0 || 
                new Date(sortedMessages[index - 1]?.createdAt || sortedMessages[index - 1]?.timestamp).toDateString() !== 
                new Date(msg.createdAt || msg.timestamp).toDateString();

            return (
              <div key={messageId}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className={`flex items-center justify-center ${index === 0 ? (compactMode ? 'mb-4' : 'mb-6') : (compactMode ? 'my-4' : 'my-6')}`}>
                    <div className="bg-[#064E3B]/40 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-[#10B981]/20">
                      <span className="text-xs font-semibold text-[#D1FAE5]/60">
                        {formatDateLabel(msg.createdAt || msg.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* System Message */}
                {msg.type === 'system' ? (
                  <SystemMessage message={msg} />
                ) : (
                  /* Regular Message */
                  <div
                    ref={(el) => { messageRefs.current[messageId] = el; }}
                  >
                    <MessageBubble
                      message={msg}
                      isOwn={isOwn}
                      senderName={isGroupChat ? resolvedSenderName : (isOwn ? 'You' : chatContact.name)}
                      senderAvatar={isGroupChat ? resolvedSenderAvatar : ''}
                      showSenderName={isGroupChat && !isOwn}
                      onDelete={onDeleteMessage}
                      searchQuery={searchQuery}
                      isHighlighted={isCurrentResult}
                      isLastOwnMessage={isLastOwnMessage}
                      currentUserId={currentUser._id}
                      onAddReaction={handleAddReaction}
                      onRemoveReaction={handleRemoveReaction}
                    />
                  </div>
                )}
              </div>
            );
            });
          })()}

          {/* Typing Indicator */}
          {isAnyoneTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-2">
                <TypingIndicator />
                <span className="text-xs text-[#D1FAE5]/60 font-medium">
                  {selectedUser?.name || selectedGroup?.name} is typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Block Status Banners */}
      {!isGroupChat && blockStatus && (
        <>
          {blockStatus.hasBlockedThem && (
            <BlockedBanner
              userName={chatContact.name}
              onUnblock={() => onUnblockUser?.(chatContact._id || chatContact.id)}
            />
          )}
          {blockStatus.isBlockedByThem && !blockStatus.hasBlockedThem && (
            <BlockedByBanner userName={chatContact.name} />
          )}
        </>
      )}

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onInputChange={handleInputChange} 
        onOpenChatbot={onOpenChatbot} 
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        disabled={blockStatus?.isBlocked || false}
      />
    </div>
  );
};

ChatWindow.propTypes = {
  selectedUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    status: PropTypes.string,
  }),
  selectedGroup: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    memberCount: PropTypes.number,
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      _id: PropTypes.string,
      sender: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
      senderId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
      createdAt: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  onSendMessage: PropTypes.func,
  onTyping: PropTypes.func,
  onBlockUser: PropTypes.func,
  onUnblockUser: PropTypes.func,
  onClearChat: PropTypes.func,
  typingUsers: PropTypes.object,
  onlineUsers: PropTypes.instanceOf(Set),
  onOpenProfile: PropTypes.func.isRequired,
  onCloseProfile: PropTypes.func.isRequired,
  onDeleteMessage: PropTypes.func,
  isProfileOpen: PropTypes.bool.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
  }),
  compactMode: PropTypes.bool.isRequired,
  onOpenChatbot: PropTypes.func,
  onFavoriteToggle: PropTypes.func,
  onGroupFavoriteToggle: PropTypes.func,
  onLeaveGroup: PropTypes.func,
  allUsers: PropTypes.array,
  onDeleteGroup: PropTypes.func,
  onGroupUpdate: PropTypes.func,
  uploadProgress: PropTypes.number,
  isUploading: PropTypes.bool,
  blockStatus: PropTypes.shape({
    isBlocked: PropTypes.bool,
    hasBlockedThem: PropTypes.bool,
    isBlockedByThem: PropTypes.bool,
  }),
  currentConversation: PropTypes.object,
  isMuted: PropTypes.bool,
  onMuteConversation: PropTypes.func,
};

export default ChatWindow;
