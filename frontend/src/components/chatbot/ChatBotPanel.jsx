import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Send, Bot, Sparkles } from 'lucide-react';
import BotMessage from './BotMessage';

const ChatBotPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const messagesEndRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: window.innerWidth - 400, y: 100 });

  // Update position ref whenever position changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle mouse down on header
  const handleHeaderMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  };

  // Handle mouse move and mouse up
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      setPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you with that.",
        "I understand what you're asking. Here's what I think...",
        "Based on your message, I'd suggest the following approach.",
        "Interesting! Let me provide you with some insights.",
        "I'm here to help! Let me break that down for you.",
      ];

      const botMessage = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '384px',
      }}
    >
      <div className="w-full h-[600px] bg-white rounded-3xl shadow-2xl border-2 border-gray-200 flex flex-col overflow-hidden">
        {/* Header - Draggable */}
        <div 
          onMouseDown={handleHeaderMouseDown}
          className="h-20 bg-linear-to-r from-[#013220] to-[#014a2f] px-6 flex items-center justify-between shadow-lg cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                AI Assistant
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              <p className="text-white/80 text-xs">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors pointer-events-auto"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          {messages.map((msg) => (
            <BotMessage
              key={msg.id}
              message={msg}
              isUser={msg.isUser}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-md">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-gray-100 bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="
                flex-1 px-4 py-3
                bg-gray-50 border-2 border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:border-[#013220] focus:ring-4 focus:ring-[#013220]/10
                transition-all duration-300
              "
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="
                p-3 rounded-xl
                bg-linear-to-r from-[#013220] to-[#014a2f]
                hover:from-[#014a2f] hover:to-[#016338]
                text-white shadow-lg shadow-[#013220]/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-105 active:scale-95
                transition-all duration-200
              "
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

ChatBotPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChatBotPanel;
