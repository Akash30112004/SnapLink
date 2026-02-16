import PropTypes from 'prop-types';
import { X, Trash2 } from 'lucide-react';

const ImagePreviewModal = ({ imageUrl, userName, onClose, onRemove }) => {
  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this profile picture?')) {
      if (onRemove) {
        await onRemove();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="absolute -top-12 right-16 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Remove profile picture"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <img
            src={imageUrl}
            alt={userName}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      </div>
    </div>
  );
};

ImagePreviewModal.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
};

ImagePreviewModal.defaultProps = {
  onRemove: null,
};

export default ImagePreviewModal;
