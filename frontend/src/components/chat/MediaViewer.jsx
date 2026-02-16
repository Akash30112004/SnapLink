import { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const MediaViewer = ({ media, currentIndex = 0, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);

  if (!media || media.length === 0) return null;

  const currentMedia = media[index];
  const isVideo = currentMedia.type === 'video';

  const handlePrevious = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentMedia.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-10"
        title="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-10"
        title="Download"
      >
        <Download className="w-6 h-6" />
      </button>

      {/* Zoom controls (images only) */}
      {!isVideo && (
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn className="w-6 h-6" />
          </button>
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
            title="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
            title="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Media content */}
      <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto">
        {isVideo ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={currentMedia.url}
            alt={currentMedia.filename}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
      </div>

      {/* Counter */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
          {index + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

MediaViewer.propTypes = {
  media: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      filename: PropTypes.string,
    })
  ).isRequired,
  currentIndex: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default MediaViewer;
