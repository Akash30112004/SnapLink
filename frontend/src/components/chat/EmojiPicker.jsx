import { useRef } from 'react';
import PropTypes from 'prop-types';
import EmojiPickerLib from 'emoji-picker-react';

const EmojiPicker = ({ onEmojiSelect, position = 'top' }) => {
  const pickerRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    onEmojiSelect?.(emojiObject.emoji);
  };

  return (
    <div
      ref={pickerRef}
      className={`
        absolute z-50 rounded-lg shadow-2xl border border-[#10B981]/40 bg-[#064E3B]
        overflow-hidden
        ${position === 'top' ? 'bottom-full mb-3' : 'top-full mt-3'}
        left-0
      `}
    >
      <EmojiPickerLib
        onEmojiClick={handleEmojiClick}
        theme="dark"
        autoFocusSearch={false}
        width={300}
        height={380}
        previewConfig={{
          showPreview: false,
        }}
        skinTonesDisabled
      />
    </div>
  );
};

EmojiPicker.propTypes = {
  onEmojiSelect: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['top', 'bottom']),
};

EmojiPicker.defaultProps = {
  position: 'top',
};

export default EmojiPicker;
