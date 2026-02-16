import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, role, content, avatar }) => {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-[#064E3B]/40 to-[#022C22]/40 border border-[#10B981]/20 hover:border-[#10B981]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#10B981]/10 group">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#10B981] text-[#10B981]" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[#D1FAE5] mb-4 leading-relaxed text-sm">
        "{content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#10B981] to-[#065F46] flex items-center justify-center text-white font-bold group-hover:shadow-lg transition-shadow">
          {avatar}
        </div>
        <div>
          <p className="text-[#D1FAE5] font-semibold text-sm">{name}</p>
          <p className="text-[#D1FAE5]/60 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  avatar: PropTypes.string.isRequired,
};

export default TestimonialCard;
