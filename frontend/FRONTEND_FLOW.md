# SnapLink Frontend Flow Overview

This document summarizes the current frontend structure, flow, and key UI behaviors so backend integration can follow a clear path.

## Project Entry
- Vite app.
- Entry point: src/main.jsx
- App shell: src/App.jsx
- Global styles: src/index.css, src/styles/*, Tailwind config.

## Routing
- Route constants: src/utils/constants.js
- Key routes:
  - / (Home)
  - /login (Sign in)
  - /register (Sign up)
  - /chat (Main chat app)

## Pages
- Home page: src/pages/Home.jsx
  - Marketing layout, features, CTA, social proof.
- Login page: src/pages/Login.jsx
  - Auth form, SnapLink navbar link to home.
- Register page: src/pages/Register.jsx
  - Auth form, SnapLink navbar link to home.
- Chat page: src/pages/Chat.jsx
  - Main app layout.

## Layout
- Main layout: src/layouts/MainLayout.jsx
  - Left sidebar + center chat window + right profile panel.
  - Contacts modal mounted here.
  - Selected user and selected group stored in state.

## Sidebar (Left)
- Component: src/components/sidebar/Sidebar.jsx
  - Tabs: All, Chats, Groups, Favourite.
  - Search input with dynamic placeholder based on active tab.
  - Filters favorites from users and groups.
  - Contacts button opens ContactsModal.
- User list: src/components/sidebar/UserList.jsx
- User item: src/components/sidebar/UserItem.jsx
  - Shows avatar, name, time, and last message.
  - Unread behavior:
    - If unreadCount == 1: last message is bold.
    - If unreadCount > 1: shows "X+ new messages" in green.

## Groups
- Group list: src/components/sidebar/GroupList.jsx
  - Group avatar, name, last sender, last message, member count.
  - Unread behavior:
    - If unreadCount == 1: last message is bold.
    - If unreadCount > 1: shows "X+ new messages" in green.

## Chat Window (Center)
- Component: src/components/chat/ChatWindow.jsx
  - Supports user and group chat views.
  - Group chat shows sender names for messages.
  - Message bubble: src/components/chat/MessageBubble.jsx
  - Chat header: src/components/chat/ChatHeader.jsx
    - Text only (voice/video removed).

## Right Profile Panel
- Own profile: src/components/chat/OwnProfilePanel.jsx
  - Large centered avatar.
  - Editable display name (inline edit).
- User profile: src/components/chat/UserProfilePanel.jsx
  - Email shown without boxed styling.

## Contacts Modal
- Component: src/components/modals/ContactsModal.jsx
  - Larger modal with a search bar.
  - Search filters by name and email.
  - Select user to start a chat.

## Data Layer (Frontend Only)
- Mock data: src/utils/dummyData.js
  - Users and groups with:
    - isFavorite flag
    - unreadCount
    - lastMessage and time
    - members for groups
- Helpers: src/utils/helpers.js
  - Validation, formatting (time, etc).

## Visual Theme
- Dark green palette:
  - Background: #022C22
  - Panels: #064E3B with opacity
  - Accent: #10B981
- Capsule style tabs and inputs.
- Borders mostly removed for seamless panels.

## Current Frontend Behaviors
- Tabs filter between all, chats, groups, favourites.
- Favourites list shows only items with isFavorite true.
- Unread logic affects the last message preview style.
- Selecting a chat or group updates the chat window view.

## Backend Integration Targets
- Auth:
  - /login and /register should call backend auth endpoints.
  - Replace setTimeout mocks with real API calls.
- Users and groups:
  - Replace dummyData with API results.
  - Provide unreadCount, lastMessage, lastMessageTime.
- Messaging:
  - Socket.IO for realtime updates.
  - Send/receive messages, typing indicators.
- Presence:
  - Online status for users.
- Search:
  - Contacts modal search can be enhanced with API queries.

## Suggested API Contracts (Draft)
- Auth
  - POST /api/auth/login
  - POST /api/auth/register
- Users
  - GET /api/users
  - GET /api/users/:id
- Groups
  - GET /api/groups
  - GET /api/groups/:id
- Messages
  - GET /api/messages?threadId=...
  - POST /api/messages
- Socket events
  - connect, disconnect
  - message
  - typing, stop_typing
  - user_online, user_offline

## Notes
- Frontend currently uses local state to switch between user and group chats.
- Group chat messages show sender names.
- Unread indicators are now text-based, not dots.
