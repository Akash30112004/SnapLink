import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip, Smile, Bot } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import AttachmentPreview from './AttachmentPreview';

const MessageInput = ({ onSendMessage, onInputChange, onOpenChatbot, uploadProgress, isUploading, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (disabled) return;
    const newValue = e.target.value;
    setMessage(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      if (onInputChange) {
        onInputChange('');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (onInputChange) {
      onInputChange(message + emoji);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB

      if (!isImage && !isVideo) {
        alert(`${file.name} is not a valid image or video file`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 100MB`);
        return false;
      }
      return true;
    });

    setAttachedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    e.target.value = ''; // Reset input
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-[#10B981]/20 bg-[#064E3B]/40 backdrop-blur-xl">
      {attachedFiles.length > 0 && (
        <AttachmentPreview files={attachedFiles} onRemove={handleRemoveFile} />
      )}
      
      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="px-6 pt-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#064E3B] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-[#10B981] font-medium min-w-[45px]">{uploadProgress}%</span>
          </div>
          <p className="text-xs text-[#D1FAE5]/60 mt-1">Uploading files...</p>
        </div>
      )}
      
      <div className="px-6 py-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 bg-[#064E3B]/60 backdrop-blur-md border-2 border-[#10B981]/30 rounded-full shadow-lg hover:border-[#10B981]/50 transition-all duration-300 relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={disabled}
          className="flex-shrink-0 p-2.5 rounded-full hover:bg-[#10B981]/20 text-[#D1FAE5]/70 hover:text-[#10B981] transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="flex-shrink-0 p-2.5 rounded-full hover:bg-[#10B981]/20 text-[#D1FAE5]/70 hover:text-[#10B981] transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-50">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                position="top"
              />
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#10B981]/20" />

        <textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={disabled ? "Messaging is disabled" : "Type your message..."}
          rows="1"
          disabled={disabled}
          className="flex-1 px-3 py-2 bg-transparent resize-none text-[#D1FAE5] placeholder-[#D1FAE5]/50 focus:outline-none text-base leading-relaxed max-h-20 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '24px' }}
        />

        <button
          type="submit"
          disabled={!message.trim() && attachedFiles.length === 0 || isUploading || disabled}
          className="flex-shrink-0 p-2.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#065F46] hover:from-[#065F46] hover:to-[#10B981] text-white shadow-md shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-110 active:scale-95 transition-all duration-200"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>

        {onOpenChatbot && (
          <button
            type="button"
            onClick={onOpenChatbot}
            className="flex-shrink-0 p-2.5 rounded-full bg-transparent hover:bg-gradient-to-r hover:from-[#10B981] hover:to-[#065F46] text-green-500 hover:text-white hover:shadow-md hover:shadow-[#10B981]/20 transition-all duration-200 transform hover:scale-110 active:scale-95"
            title="Open AI Assistant"
          >
            <Bot className="w-5 h-5" />
          </button>
        )}
      </form>
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  onOpenChatbot: PropTypes.func,
  uploadProgress: PropTypes.number,
  disabled: PropTypes.bool,
};

MessageInput.defaultProps = {
  disabled: false,
  isUploading: PropTypes.bool,
};

export default MessageInput;
