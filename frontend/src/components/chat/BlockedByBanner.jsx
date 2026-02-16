import PropTypes from 'prop-types';
import { ShieldAlert } from 'lucide-react';

const BlockedByBanner = ({ userName }) => {
  return (
    <div className="bg-red-500/20 border-t-2 border-red-500/40 px-6 py-4 flex items-center gap-3 backdrop-blur-sm">
      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
        <ShieldAlert className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-300">
          You are blocked by {userName}
        </p>
        <p className="text-xs text-red-400/80">
          You cannot send messages to this user
        </p>
      </div>
    </div>
  );
};

BlockedByBanner.propTypes = {
  userName: PropTypes.string.isRequired,
};

export default BlockedByBanner;
