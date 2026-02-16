import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, Loader } from 'lucide-react';

const ImageCropModal = ({ imageFile, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef(null);

  // Load the image file
  useState(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((img) => {
    imageRef.current = img;
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imageRef.current) {
      return null;
    }

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    const pixelRatio = window.devicePixelRatio || 1;

    // Set canvas size to crop size
    canvas.width = completedCrop.width * pixelRatio * scaleX;
    canvas.height = completedCrop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = imageFile.name;
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop, imageFile]);

  const handleCropConfirm = async () => {
    try {
      setIsProcessing(true);
      const croppedImageBlob = await getCroppedImg();
      if (croppedImageBlob) {
        // Convert blob to File
        const croppedFile = new File([croppedImageBlob], imageFile.name, {
          type: 'image/jpeg',
        });
        onCropComplete(croppedFile);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#064E3B] rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#10B981]/20">
          <h2 className="text-xl font-bold text-[#D1FAE5]">Crop Profile Picture</h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 rounded-lg hover:bg-[#10B981]/20 text-[#D1FAE5] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {imageSrc && (
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                />
              </ReactCrop>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#10B981]/20 bg-[#064E3B]/60">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-lg border-2 border-[#D1FAE5]/20 text-[#D1FAE5] hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            disabled={isProcessing || !completedCrop}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#065F46] text-white hover:from-[#065F46] hover:to-[#10B981] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Crop & Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ImageCropModal.propTypes = {
  imageFile: PropTypes.instanceOf(File).isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ImageCropModal;
