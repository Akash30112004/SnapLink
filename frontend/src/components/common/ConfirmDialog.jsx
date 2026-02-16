import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-[10001] w-full max-w-md mx-4 bg-[#064E3B]/95 backdrop-blur-xl border-2 border-[#10B981]/30 rounded-2xl shadow-2xl animate-scale-in">
        <div className="p-6">
          {/* Icon */}
          <div className={`flex justify-center mb-4`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDanger ? 'bg-red-500/20' : 'bg-[#10B981]/20'
            }`}>
              <AlertTriangle className={`w-8 h-8 ${
                isDanger ? 'text-red-400' : 'text-[#10B981]'
              }`} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[#D1FAE5] text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-[#D1FAE5]/80 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border-2 border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/10 transition-all font-semibold"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-semibold ${
                isDanger
                  ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
                  : 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/30'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDanger: PropTypes.bool,
};

ConfirmDialog.defaultProps = {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  isDanger: false,
};

export default ConfirmDialog;
