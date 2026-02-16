import PropTypes from 'prop-types';
import { useState } from 'react';
import { X, Lock, Loader, Eye, EyeOff } from 'lucide-react';

const ChangePasswordModal = ({ onClose, onPasswordChange }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await onPasswordChange(newPassword);
      setSuccessMessage('Password changed successfully!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#1F2937] to-[#111827] rounded-2xl shadow-2xl w-full max-w-md border-2 border-[#10B981]/30 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#10B981]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#10B981]/10">
              <Lock className="w-5 h-5 text-[#10B981]" />
            </div>
            <h2 className="text-xl font-bold text-[#D1FAE5]">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#D1FAE5]/60" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30">
              <p className="text-sm text-[#10B981] text-center font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-[#D1FAE5]/80 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading || successMessage}
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border-2 border-[#10B981]/30 text-[#D1FAE5] placeholder-[#D1FAE5]/40 focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isLoading || successMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5 text-[#D1FAE5]/60" />
                ) : (
                  <Eye className="w-5 h-5 text-[#D1FAE5]/60" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#D1FAE5]/80 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || successMessage}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111827] border-2 border-[#10B981]/30 text-[#D1FAE5] placeholder-[#D1FAE5]/40 focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || successMessage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded transition-colors disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-[#D1FAE5]/60" />
                ) : (
                  <Eye className="w-5 h-5 text-[#D1FAE5]/60" />
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || successMessage}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#065F46] text-white font-semibold hover:from-[#059669] hover:to-[#047857] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Changing...</span>
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ChangePasswordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
};

export default ChangePasswordModal;
