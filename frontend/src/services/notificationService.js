// Notification sound utility

// Create an audio element for playing sounds
let audioContext = null;
let notificationAudio = null;
let audioUnlocked = false;

const initAudioContext = () => {
  if (!audioContext) {
    try {
      // Try modern browsers first
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  }
  return audioContext;
};

const unlockAudioContext = async () => {
  if (audioUnlocked) return true;

  const ctx = initAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play a silent buffer to fully unlock audio on some browsers
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    audioUnlocked = true;
    console.log('🔊 AudioContext unlocked');
    return true;
  } catch (error) {
    console.warn('Failed to unlock audio context:', error);
    return false;
  }
};

const setupAudioUnlock = () => {
  if (typeof window === 'undefined' || audioUnlocked) return;

  const handler = () => {
    unlockAudioContext();
    window.removeEventListener('click', handler);
    window.removeEventListener('keydown', handler);
    window.removeEventListener('touchstart', handler);
  };

  window.addEventListener('click', handler, { once: true });
  window.addEventListener('keydown', handler, { once: true });
  window.addEventListener('touchstart', handler, { once: true });
};

const playBeep = async () => {
  try {
    const ctx = initAudioContext();
    if (!ctx) {
      console.warn('Cannot play notification: AudioContext not available');
      return;
    }

    // Resume audio context if necessary (required for some browsers)
    if (ctx.state === 'suspended') {
      await ctx.resume();
      console.log('🔊 AudioContext resumed');
    }

    const now = ctx.currentTime;
    const duration = 0.4; // 400ms for longer beep

    // Create oscillator for the beep sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Set frequency (800 Hz - higher pitch for more noticeable sound)
    oscillator.frequency.setValueAtTime(800, now);
    
    // Fade in quickly
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); // Increased volume to 0.5 (50%)
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
    
    console.log('🔊 Notification beep played');
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Fallback: Use HTML5 Audio element with a data URL beep
const playBeepWithAudio = () => {
  try {
    // If we don't have an audio element, create one with a data URL beep sound
    if (!notificationAudio) {
      notificationAudio = document.createElement('audio');
      notificationAudio.volume = 0.7; // 70% volume for better audibility
      // This is a simple sine wave beep encoded as base64 MP3
      // Playing a 800Hz tone for ~300ms
      notificationAudio.src = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AQACaGVhZGERAAAArSCWAKxglgCsYJYArGCWAKxglgCsYJYArGCWAKxglgCsYJYArGCWAKxglgCsYJYArGCWAKxglgCsYJYArGCWAA==';
    }
    
    // Reset and play
    notificationAudio.currentTime = 0;
    notificationAudio.play().catch((error) => {
      console.warn('Could not play audio:', error);
    });
    
    console.log('🔊 HTML5 notification sound played');
  } catch (error) {
    console.error('Error with HTML5 audio:', error);
  }
};

// Main notification sound function
const playNotificationSound = () => {
  try {
    console.log('🔔 Attempting to play notification sound...');
    // Try Web Audio API first
    playBeep();
    // Also try HTML5 audio as backup
    setTimeout(() => playBeepWithAudio(), 100);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
};

// Check if notifications are available (browser support)
const isNotificationSupported = () => {
  return typeof window !== 'undefined' && (!!window.AudioContext || !!window.webkitAudioContext);
};

// Request browser notification permission
const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied by user');
      return false;
    }

    // Permission not decided, ask user
    const permission = await Notification.requestPermission();
    console.log('🔔 Notification permission result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Show browser notification
const showBrowserNotification = (title, options = {}) => {
  try {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
      
      console.log('🔔 Browser notification shown:', title);
      return notification;
    }
  } catch (error) {
    console.error('Error showing browser notification:', error);
  }
};

// Complete notification function (sound + browser notification)
const sendNotification = (title, options = {}) => {
  try {
    // Play sound
    playNotificationSound();
    
    // Show browser notification
    showBrowserNotification(title, options);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const notificationService = {
  playNotificationSound,
  sendNotification,
  requestNotificationPermission,
  showBrowserNotification,
  isNotificationSupported,
  initAudioContext,
  setupAudioUnlock,
};

export default notificationService;
