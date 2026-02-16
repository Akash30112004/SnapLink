import PropTypes from 'prop-types';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const BlockConfirmModal = ({ isOpen, onClose, onConfirm, userName, isBlocked }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#064E3B] border-2 border-[#10B981]/30 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#10B981]/20 to-[#065F46]/20 px-6 py-5 border-b border-[#10B981]/20">
          <div className="flex items-center gap-3">
            {isBlocked ? (
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#10B981]" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
            )}
            <h3 className="text-xl font-bold text-[#D1FAE5]">
              {isBlocked ? 'Unblock User?' : 'Block User?'}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-[#D1FAE5]/80 leading-relaxed">
            {isBlocked ? (
              <>
                Are you sure you want to unblock <span className="font-semibold text-[#10B981]">{userName}</span>?
                <br /><br />
                They will be able to send you messages again.
              </>
            ) : (
              <>
                Are you sure you want to block <span className="font-semibold text-red-400">{userName}</span>?
                <br /><br />
                • They won&apos;t be able to send you messages
                <br />
                • You won&apos;t be able to send them messages
                <br />
                • They will see that they are blocked
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 bg-[#022C22]/40 border-t border-[#10B981]/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#064E3B]/60 hover:bg-[#064E3B] text-[#D1FAE5] font-medium transition-all duration-200 border border-[#10B981]/20"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isBlocked
                ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>
    </div>
  );
};

BlockConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
  isBlocked: PropTypes.bool,
};

BlockConfirmModal.defaultProps = {
  isBlocked: false,
};

export default BlockConfirmModal;
