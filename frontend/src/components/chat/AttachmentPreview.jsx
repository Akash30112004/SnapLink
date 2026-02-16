import { useState } from 'prop-types';
import PropTypes from 'prop-types';
import { X, Image, Video, File as FileIcon } from 'lucide-react';

const AttachmentPreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  const renderPreview = (file, index) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const previewUrl = file.preview || URL.createObjectURL(file);

    return (
      <div
        key={index}
        className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#064E3B] border border-[#10B981]/30 group"
      >
        {isImage ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            muted
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon className="w-8 h-8 text-[#10B981]" />
          </div>
        )}
        
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove"
        >
          <X className="w-3 h-3" />
        </button>

        {/* File type indicator */}
        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-white flex items-center gap-1">
          {isImage ? (
            <Image className="w-3 h-3" />
          ) : isVideo ? (
            <Video className="w-3 h-3" />
          ) : (
            <FileIcon className="w-3 h-3" />
          )}
        </div>

        {/* File size */}
        <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-white">
          {formatFileSize(file.size)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-[#022C22] border-t border-[#10B981]/20">
      {files.map((file, index) => renderPreview(file, index))}
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
};

AttachmentPreview.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  onRemove: PropTypes.func.isRequired,
};

AttachmentPreview.defaultProps = {
  files: [],
};

export default AttachmentPreview;
