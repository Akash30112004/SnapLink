import PropTypes from 'prop-types';
import { getInitials, getRandomColor } from '../../utils/helpers';

const Avatar = ({ 
  src, 
  name = '', 
  size = 'md', 
  online = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };
  
  const onlineIndicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };
  
  const bgColor = getRandomColor(name);
  const initials = getInitials(name);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center font-bold shadow-lg ${!src ? bgColor : 'bg-gray-200'} ring-2 ring-[#10B981]/30`}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold">{initials}</span>
        )}
      </div>
      {online && (
        <span 
          className={`absolute bottom-0 right-0 ${onlineIndicatorSizes[size]} bg-[#10B981] border-2 border-[#022C22] rounded-full animate-pulse`}
          title="Online"
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  online: PropTypes.bool,
  className: PropTypes.string,
};

export default Avatar;
