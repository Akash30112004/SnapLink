import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const Loader = ({ size = 'md', text = '', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizes[size]} text-[#013220] animate-spin`} />
        <div className="absolute inset-0 blur-xl opacity-50">
          <Loader2 className={`${sizes[size]} text-[#013220] animate-spin`} />
        </div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  text: PropTypes.string,
  className: PropTypes.string,
};

export default Loader;
