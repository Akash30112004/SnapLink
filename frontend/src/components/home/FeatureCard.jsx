import PropTypes from 'prop-types';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-[#064E3B]/40 to-[#022C22]/40 border border-[#10B981]/20 hover:border-[#10B981]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#10B981]/20 transform hover:scale-105 hover:-translate-y-2">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon */}
      <div className="relative z-10 w-14 h-14 rounded-xl bg-linear-to-br from-[#10B981] to-[#065F46] flex items-center justify-center mb-4 group-hover:shadow-xl group-hover:shadow-[#10B981]/30 transition-all duration-300">
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#D1FAE5] mb-3 group-hover:text-[#10B981] transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#D1FAE5]/80 leading-relaxed text-sm">
        {description}
      </p>

      {/* Accent line */}
      <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-[#10B981] to-transparent rounded-full w-0 group-hover:w-full transition-all duration-300" />
    </div>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default FeatureCard;
