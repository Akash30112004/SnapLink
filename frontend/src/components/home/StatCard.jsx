import PropTypes from 'prop-types';

const StatCard = ({ number, label, icon: Icon }) => {
  return (
    <div className="text-center group">
      <div className="mb-3 flex justify-center">
        <Icon className="w-8 h-8 text-[#10B981] group-hover:scale-110 transition-transform duration-300" />
      </div>
      <p className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-[#10B981] to-[#065F46] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
        {number}
      </p>
      <p className="text-[#D1FAE5]/80 text-sm font-medium">{label}</p>
    </div>
  );
};

StatCard.propTypes = {
  number: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default StatCard;
