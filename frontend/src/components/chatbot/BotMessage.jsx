import PropTypes from 'prop-types';
import { Bot, User } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

const BotMessage = ({ message, isUser }) => {
  return (
    <div className={`flex gap-3 mb-4 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md
        ${isUser ? 'bg-linear-to-br from-[#013220] to-[#014a2f]' : 'bg-linear-to-br from-gray-700 to-gray-900'}
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          px-4 py-3 rounded-2xl shadow-md
          ${isUser 
            ? 'bg-linear-to-r from-[#013220] to-[#014a2f] text-white rounded-br-sm' 
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
          }
        `}>
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

BotMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  isUser: PropTypes.bool.isRequired,
};

export default BotMessage;
