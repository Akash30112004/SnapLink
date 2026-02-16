import PropTypes from 'prop-types';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const BlockedBanner = ({ userName, onUnblock }) => {
  return (
    <div className="bg-red-500/20 border-t-2 border-red-500/40 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-300">
            You blocked {userName}
          </p>
          <p className="text-xs text-red-400/80">
            You cannot send or receive messages from this user
          </p>
        </div>
      </div>
      <button
        onClick={onUnblock}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-medium transition-all duration-200 hover:scale-105"
      >
        <ShieldCheck className="w-4 h-4" />
        Unblock
      </button>
    </div>
  );
};

BlockedBanner.propTypes = {
  userName: PropTypes.string.isRequired,
  onUnblock: PropTypes.func.isRequired,
};

export default BlockedBanner;
