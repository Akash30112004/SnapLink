import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { formatTime } from '../../utils/helpers';
import { Check, CheckCheck, Copy, Trash2, Smile, Play } from 'lucide-react';
import Avatar from '../common/Avatar';
import EmojiReactions from './EmojiReactions';
import EmojiPicker from './EmojiPicker';
import MediaViewer from './MediaViewer';

const MessageBubble = ({ message, isOwn, senderName, senderAvatar, showSenderName, onDelete, searchQuery, isHighlighted, isLastOwnMessage, currentUserId, onAddReaction, onRemoveReaction }) => {
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.text);
        setCopied(true);
      }
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;

    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === query.toLowerCase()) {
            return (
              <mark
                key={index}
                className="bg-yellow-200 text-gray-900 rounded px-0.5 font-semibold"
              >
                {part}
              </mark>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  const renderStatus = () => {
    if (!isOwn) return null;
    
    // Check if message has been read by looking at readBy array
    // readBy should have at least 2 entries: sender + receiver
    const isRead = message.readBy && message.readBy.length > 1;
    
    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-white" />;
    }
    return <Check className="w-4 h-4 text-white/60" />;
  };

  // Check if message contains only a single emoji
  const isSingleEmoji = () => {
    const text = message.text?.trim();
    if (!text) return false;
    // Regex to match if text is only one emoji
    const emojiRegex = /^(\p{Emoji}|\p{Emoji_Component})+$/u;
    return text.length <= 2 && emojiRegex.test(text);
  };

  const singleEmojiMode = isSingleEmoji();

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div
        className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showSenderName && !isOwn && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <Avatar name={senderName} src={senderAvatar} size="sm" />
            <span className="text-xs font-semibold text-[#10B981]">{senderName}</span>
          </div>
        )}
        <div className="relative">
          <div
            className={`
              px-5 py-3 rounded-2xl shadow-md relative group
              ${isOwn 
                ? 'bg-linear-to-r from-[#10B981] to-[#065F46] text-white rounded-br-sm' 
                : 'bg-[#064E3B]/40 backdrop-blur-xl border border-[#10B981]/20 text-[#D1FAE5] rounded-bl-sm'
              }
              ${isHighlighted ? 'ring-4 ring-yellow-200 ring-opacity-90' : ''}
              transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute -top-3 ${isOwn ? 'right-3' : 'left-3'}
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                flex items-center gap-2
              `}
            >
            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-1 rounded-lg bg-[#064E3B] border border-[#10B981]/20 text-[#D1FAE5] shadow-sm hover:bg-[#065F46]"
              title="Copy message"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {isOwn && (
              <button
                type="button"
                onClick={() => onDelete?.(message._id || message.id)}
                className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 shadow-sm hover:bg-red-500/30"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {copied && (
              <span className="text-xs bg-[#10B981] text-white px-2 py-1 rounded-lg">Copied</span>
            )}
          </div>

          {singleEmojiMode ? (
            <div className="text-7xl py-2">
              {message.text}
            </div>
          ) : message.text ? (
            <p className="text-sm md:text-base leading-relaxed wrap-break-word">
              {searchQuery ? highlightText(message.text, searchQuery) : message.text}
            </p>
          ) : null}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`grid gap-2 ${message.text ? 'mt-2' : ''} ${message.attachments.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-2 max-w-sm'}`}>
              {message.attachments.map((attachment, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setMediaIndex(index);
                    setShowMediaViewer(true);
                  }}
                  className="relative rounded-lg overflow-hidden group/media hover:opacity-90 transition-opacity"
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className={`w-full ${message.attachments.length === 1 ? 'max-h-[500px]' : 'h-40 max-h-40'} object-contain bg-black/5 rounded-lg`}
                    />
                  ) : (
                    <div className="relative w-full h-48">
                      <video
                        src={attachment.url}
                        className="w-full h-full object-contain bg-black/5"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/media:opacity-100">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwn ? 'text-white/80' : 'text-[#D1FAE5]/60'}`}>
              {formatTime(message.timestamp || message.createdAt)}
            </span>
            {renderStatus()}
          </div>

          {/* Hover effect indicator */}
          <div className={`
            absolute -top-8 left-1/2 -translate-x-1/2 
            bg-[#064E3B] border border-[#10B981]/20 text-[#D1FAE5] text-xs px-3 py-1.5 rounded-lg
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none whitespace-nowrap shadow-xl
          `}>
            {message.timestamp ? new Date(message.timestamp).toLocaleString() : new Date(message.createdAt).toLocaleString()}
          </div>
          </div>

          {/* Emoji add button - show on hover */}
          {isHovering && (
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 rounded-full text-sm transition-all duration-200 bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30 hover:scale-110 active:scale-95 animate-fade-in"
                title="Add emoji reaction"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    // Add the reaction
                    onAddReaction?.({ messageId: message._id || message.id, emoji });
                    setShowEmojiPicker(false);
                  }}
                  position="top"
                />
              )}
            </div>
          )}
        </div>

        {/* Seen indicator - show only for last own message in 1-to-1 chat */}
        {isOwn && isLastOwnMessage && message.readBy && message.readBy.length > 1 && (
          <div className="text-xs text-[#D1FAE5]/50 mt-1 mr-1">
            Seen
          </div>
        )}

        {/* Emoji Reactions */}
        <EmojiReactions
          messageId={message._id || message.id}
          reactions={message.reactions}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      </div>

      {/* Media Viewer */}
      {showMediaViewer && message.attachments && createPortal(
        <MediaViewer
          media={message.attachments}
          currentIndex={mediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />,
        document.body
      )}
    </div>
  );
};

MessageBubble.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number,
    _id: PropTypes.string,
    text: PropTypes.string,
    timestamp: PropTypes.instanceOf(Date),
    createdAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    status: PropTypes.string,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        filename: PropTypes.string,
        publicId: PropTypes.string,
        size: PropTypes.number,
        thumbnail: PropTypes.string,
      })
    ),
    reactions: PropTypes.arrayOf(
      PropTypes.shape({
        emoji: PropTypes.string,
        users: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }).isRequired,
  isOwn: PropTypes.bool.isRequired,
  senderName: PropTypes.string,
  senderAvatar: PropTypes.string,
  showSenderName: PropTypes.bool,
  onDelete: PropTypes.func,
  searchQuery: PropTypes.string,
  isHighlighted: PropTypes.bool,
  isLastOwnMessage: PropTypes.bool,
  currentUserId: PropTypes.string,
  onAddReaction: PropTypes.func,
  onRemoveReaction: PropTypes.func,
};

MessageBubble.defaultProps = {
  showSenderName: false,
  onDelete: null,
  senderAvatar: '',
  searchQuery: '',
  isHighlighted: false,
  isLastOwnMessage: false,
};

export default MessageBubble;
