# SnapLink Implementation Overview

This document summarizes the current implementation state of the SnapLink project, based on work completed so far. It focuses on features, architecture, and the key files to check when making future changes.

## 1. High-Level Architecture

- Frontend: React + Vite + Socket.IO client
- Backend: Node.js + Express + MongoDB + Mongoose + Socket.IO
- AI: Local Ollama server (Llama 3) running at http://localhost:11434
- Notifications: Web Audio API + HTML5 Audio fallback + Browser Notifications API
- Storage: localStorage for UI settings and per-chat mute state

## 2. Core Features Implemented

### Authentication
- Forgot password flow
- Change password
- Logout

### Chat (Realtime)
- Socket.IO message delivery
- Optimistic UI message updates for faster send
- Message ordering sorted by timestamp to fix out-of-order issues
- Real-time reactions and deletions

### AI Chatbot
- Gemini integration replaced by local Ollama + Llama 3
- Non-blocking AI response handling in backend

### Notifications
- Sound notifications (Web Audio API)
- HTML5 Audio fallback
- Desktop/browser notifications
- Global notification on/off toggle
- Global sound on/off toggle
- Per-conversation mute (localStorage persisted)

## 3. Notifications Behavior (Current)

- Notification logic is triggered on incoming Socket.IO events.
- Each client decides whether to notify based on its own settings.
- Sound and popup are controlled independently:
  - Notifications toggle -> Browser popup
  - Sound toggle -> Audio beep
- Per-conversation mute overrides both sound and popup.
- Bot messages do not trigger notifications.

## 4. Key Frontend Files

### notificationService
- File: frontend/src/services/notificationService.js
- Responsibilities:
  - Audio sound generation (Web Audio + HTML5 fallback)
  - Desktop notifications via Notification API
  - Audio unlock handler for browser autoplay policies

### Main layout
- File: frontend/src/layouts/MainLayout.jsx
- Responsibilities:
  - Socket.IO listener for receive_message
  - Notification logic (sound + popup)
  - Settings persistence in localStorage
  - Per-conversation mute state

### Chat UI
- Chat header: frontend/src/components/chat/ChatHeader.jsx
  - Mute/unmute toggle button per conversation
- Chat window: frontend/src/components/chat/ChatWindow.jsx
  - Passes mute state and toggle handler down to ChatHeader

### Settings
- Settings modal: frontend/src/components/modals/SettingsModal.jsx
  - Global toggles: Notifications, Sound, Compact mode, Message previews
- Own profile panel: frontend/src/components/chat/OwnProfilePanel.jsx
  - Uses shared settings state to update notification toggle

### Constants
- File: frontend/src/utils/constants.js
- Important keys:
  - STORAGE_KEYS.SETTINGS
  - STORAGE_KEYS.MUTED_CONVERSATIONS

## 5. Key Backend Files

### Message controller
- File: backend/src/controllers/message.controller.js
- Responsibilities:
  - Message creation
  - Emit receive_message to Socket.IO rooms
  - AI response generation in background (non-blocking)

## 6. Data Flow Summary

### Message Send
1. User sends message -> backend saves
2. Backend emits receive_message to conversation room
3. Frontend listener updates UI
4. If notification conditions pass -> sound + popup

### Notification Decision (Client)
- If message is not from self
- If message is not from bot
- If conversation not muted
- If sound toggle ON -> play sound
- If notifications toggle ON -> show popup

## 7. Common Troubleshooting

- No sound: browser autoplay policy requires a user interaction first
- Notifications not shown: browser permission must be granted
- Per-chat mute not working: check stored IDs in localStorage

## 8. Quick File Map

- frontend/src/layouts/MainLayout.jsx
- frontend/src/services/notificationService.js
- frontend/src/components/chat/ChatHeader.jsx
- frontend/src/components/chat/ChatWindow.jsx
- frontend/src/components/chat/OwnProfilePanel.jsx
- frontend/src/components/modals/SettingsModal.jsx
- frontend/src/utils/constants.js
- backend/src/controllers/message.controller.js

## 9. Suggested Next Steps

- Add click behavior for browser notifications to open the related chat
- Add visual indicator for muted conversations in the sidebar
- Add per-group notification override if needed
