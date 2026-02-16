import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

const SystemMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 bg-[#064E3B]/40 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-[#10B981]/20">
        <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-[#D1FAE5]">
          {message.text}
        </span>
        <span className="text-xs text-[#D1FAE5]/60">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
        </span>
      </div>
    </div>
  );
};

SystemMessage.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    text: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    type: PropTypes.string,
  }).isRequired,
};

export default SystemMessage;
