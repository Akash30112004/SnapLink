import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({ 
  type = 'text',
  label,
  error,
  placeholder,
  icon: Icon,
  fullWidth = true,
  className = '',
  ...props 
}, ref) => {
  const baseStyles = 'bg-white/5 border-2 rounded-xl px-4 py-3.5 text-[#D1FAE5] placeholder-[#D1FAE5]/40 transition-all duration-300 ease-in-out focus:outline-none shadow-sm hover:shadow-md backdrop-blur-sm';
  const focusStyles = 'focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/20 focus:shadow-lg';
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#10B981]/20';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconPadding = Icon ? 'pl-12' : '';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-semibold text-[#D1FAE5] mb-2.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${error ? 'text-red-500' : 'text-[#D1FAE5]/60 group-focus-within:text-[#10B981]'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`${baseStyles} ${focusStyles} ${errorStyles} ${widthClass} ${iconPadding} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
