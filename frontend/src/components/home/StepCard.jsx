import PropTypes from 'prop-types';
import { CheckCircle } from 'lucide-react';

const StepCard = ({ number, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center group">
      {/* Step Number Circle */}
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#10B981] to-[#065F46] flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:shadow-[#10B981]/30 transform group-hover:scale-110 transition-all duration-300">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>

      {/* Title */}
      <h4 className="text-xl font-bold text-[#D1FAE5] mb-2 group-hover:text-[#10B981] transition-colors duration-300">
        {title}
      </h4>

      {/* Description */}
      <p className="text-[#D1FAE5]/80 text-sm leading-relaxed max-w-xs mb-4">
        {description}
      </p>

      {/* Checkmark */}
      <CheckCircle className="w-6 h-6 text-[#10B981] opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300" />
    </div>
  );
};

StepCard.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default StepCard;
