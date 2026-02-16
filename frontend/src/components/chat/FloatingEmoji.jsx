import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const FloatingEmoji = ({ emoji, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animation duration should match CSS animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [emoji, onComplete]);

  if (!isAnimating) {
    return null;
  }

  return (
    <div
      className={`
        fixed pointer-events-none text-3xl select-none
        animate-float-up
      `}
      style={{
        left: '50%',
        top: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        zIndex: 9999,
      }}
    >
      {emoji}
    </div>
  );
};

FloatingEmoji.propTypes = {
  emoji: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
};

FloatingEmoji.defaultProps = {
  onComplete: null,
};

export default FloatingEmoji;
