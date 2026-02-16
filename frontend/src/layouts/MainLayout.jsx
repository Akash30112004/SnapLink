import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import OwnProfilePanel from '../components/chat/OwnProfilePanel';
import SettingsModal from '../components/modals/SettingsModal';
import ContactsModal from '../components/modals/ContactsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ROUTES, STORAGE_KEYS } from '../utils/constants';
import userService from '../services/userService';
import groupService from '../services/groupService';
import messageService from '../services/messageService';
import conversationService from '../services/conversationService';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import { uploadAPI } from '../services/api';

// Helper function to create lastMessage preview from message
const createMessagePreview = (message) => {
  if (message.text) return message.text;
  
  if (message.attachments && message.attachments.length > 0) {
    const imageCount = message.attachments.filter(a => a.type === 'image').length;
    const videoCount = message.attachments.filter(a => a.type === 'video').length;
    
    if (imageCount > 0 && videoCount > 0) {
      return `📎 ${imageCount} photo${imageCount > 1 ? 's' : ''}, ${videoCount} video${videoCount > 1 ? 's' : ''}`;
    } else if (imageCount > 0) {
      return `📷 ${imageCount} photo${imageCount > 1 ? 's' : ''}`;
    } else if (videoCount > 0) {
      return `🎥 ${videoCount} video${videoCount > 1 ? 's' : ''}`;
    }
  }
  
  return '';
};

const MainLayout = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOwnProfileOpen, setIsOwnProfileOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isCreateGroupMode, setIsCreateGroupMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [blockStatus, setBlockStatus] = useState(null);
  const [uiSettings, setUiSettings] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
    return {
      notifications: true,
      sound: true,
      compactMode: false,
      previews: true,
    };
  });
  const [mutedConversations, setMutedConversations] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.MUTED_CONVERSATIONS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse muted conversations:', error);
      }
    }
    return [];
  });

  // Load users and groups on mount
  useEffect(() => {
    let isMounted = true;

    // Clear any pending disconnect if component remounted quickly
    if (socketService.disconnectTimer) {
      clearTimeout(socketService.disconnectTimer);
      socketService.disconnectTimer = null;
    }

    // Request notification permission from browser
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      notificationService.requestNotificationPermission();
    }

    // Ensure audio is unlocked after the first user interaction
    notificationService.setupAudioUnlock();

    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (!storedUser) {
          navigate(ROUTES.LOGIN);
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData._id || userData.id; // Support both formats

        if (!userId) {
          console.error('No user ID found');
          navigate(ROUTES.LOGIN);
          return;
        }

        // Set current authenticated user
        setCurrentUser(userData);

        // Connect socket only if not already connected
        if (!socketService.socket?.connected) {
          socketService.connect(userId);
        }

        // Fetch users, groups, and conversations
        const [usersRes, groupsRes, conversationsRes] = await Promise.all([
          userService.getUsers(),
          groupService.getGroups(),
          conversationService.getConversations(),
        ]);

        if (isMounted) {
          // Filter out current user from the users list to avoid duplicates
          const filteredUsers = (usersRes.users || []).filter(
            user => user._id !== userId && user.id !== userId
          );

          // Create a map of conversations by other member ID for quick lookup
          const conversations = conversationsRes.conversations || [];
          const conversationMap = new Map();
          
          conversations.forEach(conv => {
            if (!conv.isGroup && conv.members && conv.members.length === 2) {
              // Find the other member (not current user)
              const otherMember = conv.members.find(
                member => {
                  const memberId = member._id || member;
                  return memberId.toString() !== userId && memberId !== userId;
                }
              );
              if (otherMember) {
                const otherMemberId = otherMember._id || otherMember;
                conversationMap.set(otherMemberId.toString(), {
                  conversationId: conv._id,
                  lastMessage: conv.lastMessage && conv.lastMessage.trim() ? conv.lastMessage : '',
                  lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime) : null,
                });
              }
            }
          });

          // Enrich users with last message data from conversations
          const enrichedUsers = filteredUsers.map(user => {
            const userIdStr = (user._id || user.id).toString();
            const convData = conversationMap.get(userIdStr);
            
            const enriched = {
              ...user,
              lastMessage: convData?.lastMessage || '',
              lastMessageTime: convData?.lastMessageTime || null,
              unreadCount: 0, // Will be updated by socket events
            };
            
            // Debug logging
            if (convData?.lastMessage) {
              console.log(`📝 Enriched "${user.name}" with message: "${convData.lastMessage.substring(0, 40)}"`);
            }
            
            return enriched;
          });

          // Create a map of group conversations for quick lookup
          const groupConversationMap = new Map();
          conversations.forEach(conv => {
            if (conv.isGroup) {
              groupConversationMap.set(conv._id.toString(), {
                lastMessage: conv.lastMessage || '',
                lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime) : null,
                lastMessageSender: conv.lastMessageSender || '',
              });
            }
          });

          // Enrich groups with last message data from conversations
          const enrichedGroups = (groupsRes.groups || []).map(group => {
            const groupIdStr = (group._id || group.id).toString();
            const convData = groupConversationMap.get(groupIdStr);
            
            return {
              ...group,
              lastMessage: convData?.lastMessage || '',
              lastMessageTime: convData?.lastMessageTime || null,
              lastMessageSender: convData?.lastMessageSender || '',
              memberCount: group.members?.length || 0,
              unreadCount: 0, // Will be updated by socket events
            };
          });

          setUsers(enrichedUsers);
          setGroups(enrichedGroups);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        if (error.response?.status === 401) {
          navigate(ROUTES.LOGIN);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function with delayed disconnect (handles React Strict Mode)
    return () => {
      isMounted = false;
      
      // Delay disconnect to handle React Strict Mode double-render
      // Store timer on socketService so it persists across effect cleanup/setup
      socketService.disconnectTimer = setTimeout(() => {
        socketService.offReceiveMessage();
        socketService.disconnect();
        socketService.disconnectTimer = null;
      }, 100);
    };
  }, [navigate]); // Only run once on mount

  // Setup Socket.IO listeners for real-time messages
  useEffect(() => {
    // First, remove any existing listener for receive_message
    socketService.offReceiveMessage();
    
    // Then register the new one
    socketService.onReceiveMessage((payload) => {
      console.log('📨 Socket: Received message event:', payload);
      console.log('📨 Current conversation ID:', currentConversation?._id);
      console.log('📨 Payload conversation ID:', payload.conversationId);
      
      const convId = payload.conversationId || payload.message?.conversationId;
      const normalizedConvId = convId?.toString();
      const incomingMessage = payload.message || payload;
      const currentUserId = currentUser?._id || currentUser?.id || JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}')?._id;
      const senderId = incomingMessage.sender?._id || incomingMessage.sender || incomingMessage.senderId;
      const isActiveConversation = normalizedConvId && currentConversation?._id?.toString() === normalizedConvId;
      const isOwnMessage = senderId && currentUserId && senderId === currentUserId;
      
      console.log('📨 Parsed - convId:', convId, 'message:', {
        _id: incomingMessage._id,
        sender: incomingMessage.sender,
        text: incomingMessage.text?.substring(0, 30),
        isBot: incomingMessage.sender?.isBot,
      });
      console.log('📨 Is active conversation?', isActiveConversation);
      console.log('📨 Is own message?', isOwnMessage);
      console.log('📨 Is bot message?', incomingMessage.sender?.isBot);
      console.log('📨 Sound settings:', { notifications: uiSettings.notifications, sound: uiSettings.sound, conversationMuted: mutedConversations.includes(normalizedConvId) });
      
      const canNotify = !isOwnMessage && !incomingMessage.sender?.isBot && !mutedConversations.includes(normalizedConvId);
      const shouldPlaySound = canNotify && uiSettings.sound;
      const shouldShowPopup = canNotify && uiSettings.notifications;

      // Play notification sound and show browser notification for incoming messages
      if (shouldPlaySound || shouldShowPopup) {
        console.log('🔔 Sending notification for incoming message');

        // Prepare notification title and message
        const senderName = incomingMessage.sender?.name || incomingMessage.senderName || 'Someone';
        const messagePreview = incomingMessage.text?.substring(0, 50) || '[Attachment]';

        // For group chats, add group name context
        let notificationTitle = senderName;
        let notificationOptions = { body: messagePreview };

        if (currentConversation?.isGroup || incomingMessage.conversationId) {
          // Try to find the group name
          const group = groups.find(g => g._id === normalizedConvId);
          if (group) {
            notificationTitle = `${senderName} in ${group.name}`;
            notificationOptions.tag = `group-${normalizedConvId}`;
          }
        }

        setTimeout(() => {
          if (shouldPlaySound) {
            notificationService.playNotificationSound();
          }
          if (shouldShowPopup) {
            notificationService.showBrowserNotification(notificationTitle, notificationOptions);
          }
        }, 100);
      } else if (isOwnMessage) {
        console.log('⚠️ Not playing sound: Own message');
      } else if (incomingMessage.sender?.isBot) {
        console.log('⚠️ Not playing sound: Bot message');
      } else if (!uiSettings.sound) {
        console.log('⚠️ Not playing sound: Sound disabled globally');
      } else if (!uiSettings.notifications) {
        console.log('⚠️ Not showing popup: Notifications disabled globally');
      } else if (mutedConversations.includes(normalizedConvId)) {
        console.log('⚠️ Not playing sound: Conversation is muted');
      }
      
      if (normalizedConvId && incomingMessage) {
        console.log('✅ Processing message for conversation:', normalizedConvId);
        setMessages((prev) => {
          const existingMessages = prev[normalizedConvId] || [];
          console.log('   Existing messages count:', existingMessages.length);
          
          // Check if message already exists (prevent duplicates)
          const messageId = incomingMessage._id || incomingMessage.id;
          const alreadyExists = existingMessages.some(
            msg => (msg._id || msg.id) === messageId
          );
          
          if (alreadyExists) {
            console.log('⚠️ Duplicate message detected:', messageId);
            return prev; // Don't add duplicate
          }
          
          console.log('✅ Adding message to conversation:', normalizedConvId);
          return {
            ...prev,
            [normalizedConvId]: [...existingMessages, incomingMessage],
          };
        });

        // Mark messages as read if conversation is active (we're the recipient)
        if (isActiveConversation && !isOwnMessage) {
          const messageId = incomingMessage._id || incomingMessage.id;
          messageService.markMessageAsRead(messageId).then((res) => {
            // Update the message in state with the read status
            if (res.message) {
              setMessages((prev) => ({
                ...prev,
                [convId]: (prev[convId] || []).map((msg) =>
                  (msg._id === messageId || msg.id === messageId) ? res.message : msg
                ),
              }));
            }
          }).catch(err => 
            console.error('Failed to mark message as read:', err)
          );
        }

        if (!isOwnMessage && !isActiveConversation) {
          const lastMessageTime = incomingMessage.createdAt || incomingMessage.timestamp || new Date().toISOString();
          const lastMessage = createMessagePreview(incomingMessage);
          const senderName = incomingMessage.sender?.name || incomingMessage.senderName || 'Unknown';

          console.log('📝 Socket: Received message in inactive conversation:', convId, 'updating sidebar');
          setGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group._id === convId) {
                console.log('✅ Socket: Updating inactive group:', group.name, 'lastMessage:', lastMessage);
                return {
                  ...group,
                  unreadCount: (group.unreadCount || 0) + 1,
                  lastMessage,
                  lastMessageTime,
                  lastMessageSender: senderName,
                };
              }
              return group;
            })
          );

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              (user._id === senderId || user.id === senderId)
                ? {
                    ...user,
                    unreadCount: (user.unreadCount || 0) + 1,
                    lastMessage,
                    lastMessageTime,
                  }
                : user
            )
          );
        } else if (isActiveConversation && (selectedUser || selectedGroup)) {
          // Also update lastMessage when conversation is active (for sender's sidebar)
          const lastMessageTime = incomingMessage.createdAt || incomingMessage.timestamp || new Date().toISOString();
          const lastMessage = createMessagePreview(incomingMessage);
          const senderName = incomingMessage.sender?.name || incomingMessage.senderName || 'Unknown';
          
          if (selectedGroup) {
            // Update group's last message and sender
            console.log('📝 Socket: Updating group lastMessage via socket:', convId, 'message:', lastMessage, 'sender:', senderName);
            setGroups((prevGroups) =>
              prevGroups.map((group) => {
                if (group._id === convId) {
                  console.log('✅ Socket: Matched group:', group.name, 'updating lastMessage');
                  return {
                    ...group,
                    lastMessage,
                    lastMessageTime,
                    lastMessageSender: senderName,
                  };
                }
                return group;
              })
            );
          } else if (selectedUser) {
            // Update user's last message
            if (!isOwnMessage) {
              // Incoming message from the other user, update them in the list
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  (user._id === senderId || user.id === senderId)
                    ? { ...user, lastMessage, lastMessageTime }
                    : user
                )
              );
            } else {
              // Own message, update the selected user's entry with our message
              const selectedUserId = selectedUser._id || selectedUser.id;
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  (user._id === selectedUserId || user.id === selectedUserId)
                    ? { ...user, lastMessage, lastMessageTime }
                    : user
                )
              );
            }
          }
        }
      } else {
        console.warn('❌ Invalid message payload - missing convId or message data');
      }
    });

    socketService.onUserOnline((data) => {
      console.log('User online:', data.userId);
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    socketService.onUserOffline((data) => {
      console.log('User offline:', data.userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    socketService.onTyping((data) => {
      if (data.conversationId === currentConversation?._id) {
        setTypingUsers((prev) => ({ ...prev, [data.userId]: true }));
      }
    });

    socketService.onStopTyping((data) => {
      if (data.conversationId === currentConversation?._id) {
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          delete newTyping[data.userId];
          return newTyping;
        });
      }
    });

    // Get initial online users
    socketService.getOnlineUsers((data) => {
      // Backend sends { users: [...] }
      const usersList = data?.users || data || [];
      if (Array.isArray(usersList)) {
        setOnlineUsers(new Set(usersList));
      }
    });

    // Listen for users coming online
    socketService.onUserOnline((payload) => {
      const { userId } = payload;
      if (userId) {
        console.log('🟢 User came online:', userId);
        setOnlineUsers((prevOnlineUsers) => {
          const newSet = new Set(prevOnlineUsers);
          newSet.add(userId.toString());
          return newSet;
        });
      }
    });

    // Listen for users going offline
    socketService.onUserOffline((payload) => {
      const { userId } = payload;
      if (userId) {
        console.log('🔴 User went offline:', userId);
        setOnlineUsers((prevOnlineUsers) => {
          const newSet = new Set(prevOnlineUsers);
          newSet.delete(userId.toString());
          return newSet;
        });
      }
    });

    // Listen for profile updates from other users
    socketService.onProfileUpdate((payload) => {
      console.log('👤 Profile update received:', payload);
      const { userId, name } = payload;
      
      if (!userId || !name) return;

      // Update the users list with new name
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const userIdStr = (user._id || user.id)?.toString();
          const payloadIdStr = userId?.toString();
          
          if (userIdStr === payloadIdStr) {
            console.log('✅ Updated user name:', user.name, '->', name);
            return { ...user, name };
          }
          return user;
        })
      );

      // Also update selectedUser if it's the one being updated
      setSelectedUser((prevSelectedUser) => {
        if (!prevSelectedUser) return prevSelectedUser;
        const selectedIdStr = (prevSelectedUser._id || prevSelectedUser.id)?.toString();
        const payloadIdStr = userId?.toString();
        
        if (selectedIdStr === payloadIdStr) {
          return { ...prevSelectedUser, name };
        }
        return prevSelectedUser;
      });
    });

    // Listen for messages seen status updates
    socketService.onMessagesSeen((payload) => {
      console.log('📖 Messages seen event:', payload);
      const { conversationId, messages: seenMessages } = payload;
      
      if (seenMessages && conversationId) {
        setMessages((prev) => ({
          ...prev,
          [conversationId]: seenMessages,
        }));
      }
    });

    // Listen for group creation events
    socketService.socket?.on('group_created', (payload) => {
      console.log('🎉 Group created event:', payload);
      const { group, recipientId } = payload;
      const currentUserId = currentUser?._id || currentUser?.id || JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}')?._id;
      
      // Only add the group if we're one of the recipients
      if (group && recipientId && recipientId === currentUserId) {
        setGroups((prevGroups) => {
          // Check if group already exists
          const exists = prevGroups.some(g => g._id === group._id);
          if (exists) {
            console.log('⚠️ Group already exists:', group._id);
            return prevGroups;
          }
          
          console.log('✅ Adding new group to list:', group.name);
          return [...prevGroups, {
            ...group,
            lastMessage: '',
            lastMessageTime: null,
            lastMessageSender: '',
            memberCount: group.members?.length || 0,
            unreadCount: 0,
          }];
        });
      }
    });

    // Listen for group deletion events
    socketService.socket?.on('group_deleted', (payload) => {
      console.log('🗑️ Group deleted event received:', payload);
      const { groupId, recipientId } = payload;
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const currentUserId = currentUser?._id || currentUser?.id || (storedUser ? JSON.parse(storedUser)._id : null);
      
      console.log('🔍 Comparing recipientId:', recipientId, 'with currentUserId:', currentUserId);
      
      // Only remove the group if we're one of the recipients
      // Convert both to strings to ensure proper comparison
      if (groupId && recipientId && currentUserId && recipientId.toString() === currentUserId.toString()) {
        console.log('✅ Match confirmed, removing group from list');
        setGroups((prevGroups) => {
          const filtered = prevGroups.filter(g => (g._id || g.id) !== groupId);
          console.log('✅ Removed group from list. Before:', prevGroups.length, 'After:', filtered.length);
          return filtered;
        });
        
        // If the deleted group is currently selected, clear selection
        if (selectedGroup?._id === groupId || selectedGroup?.id === groupId) {
          console.log('✅ Clearing selected group as it was deleted');
          setSelectedGroup(null);
          setCurrentConversation(null);
          setMessages((prev) => {
            const newMessages = { ...prev };
            delete newMessages[groupId];
            return newMessages;
          });
        }
      } else {
        console.log('⚠️ No match, group not removed. RecipientId:', recipientId, 'CurrentUserId:', currentUserId);
      }
    });

    // Listen for emoji reactions (real-time updates)
    socketService.onReactionAdded((payload) => {
      console.log('😊 Reaction added:', payload);
      const { messageId, emoji, userId, conversationId } = payload;
      if (!messageId) return;

      // Update messages state for current conversation
      const convId = conversationId || currentConversation?._id;
      if (convId) {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [convId]: prevMessages[convId]?.map((msg) => {
            if ((msg._id || msg.id)?.toString() === messageId?.toString()) {
              const existingReaction = msg.reactions?.find((r) => r.emoji === emoji);
              if (existingReaction) {
                if (!existingReaction.users?.includes(userId)) {
                  existingReaction.users = [...(existingReaction.users || []), userId];
                }
                return msg;
              }
              return {
                ...msg,
                reactions: [...(msg.reactions || []), { emoji, users: [userId] }],
              };
            }
            return msg;
          }) || [],
        }));
      }
    });

    // Listen for emoji reactions being removed
    socketService.onReactionRemoved((payload) => {
      console.log('😒 Reaction removed:', payload);
      const { messageId, emoji, userId, conversationId } = payload;
      if (!messageId) return;

      // Update messages state for current conversation
      const convId = conversationId || currentConversation?._id;
      if (convId) {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [convId]: prevMessages[convId]?.map((msg) => {
            if ((msg._id || msg.id)?.toString() === messageId?.toString()) {
              return {
                ...msg,
                reactions: msg.reactions?.map((r) => {
                  if (r.emoji === emoji) {
                    const updatedUsers = r.users?.filter((id) => id !== userId) || [];
                    if (updatedUsers.length === 0) {
                      return null;
                    }
                    return { ...r, users: updatedUsers };
                  }
                  return r;
                }).filter(r => r !== null) || [],
              };
            }
            return msg;
          }) || [],
        }));
      }
    });

    // Listen for message deletion events
    socketService.socket?.on('message_deleted', (payload) => {
      console.log('🗑️ Message deleted event received:', payload);
      const { messageId, conversationId, lastMessage, lastMessageTime, lastMessageSender } = payload;
      
      if (!messageId || !conversationId) return;

      // Remove message from local state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [conversationId]: (prevMessages[conversationId] || []).filter(
          msg => (msg._id || msg.id) !== messageId
        ),
      }));

      // Update sidebar preview with the new last message from backend
      if (currentConversation?.isGroup || selectedGroup) {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === conversationId
              ? {
                  ...group,
                  lastMessage: lastMessage || '',
                  lastMessageTime: lastMessageTime || new Date(),
                  lastMessageSender: lastMessageSender || group.lastMessageSender,
                }
              : group
          )
        );
      } else {
        // Update user's last message
        const selectedUserId = selectedUser?._id || selectedUser?.id;
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            // Find the conversation that matches this conversationId
            // For 1:1 chats, we need to update the correct user
            return user._id === selectedUserId || user.id === selectedUserId
              ? {
                  ...user,
                  lastMessage: lastMessage || '',
                  lastMessageTime: lastMessageTime || new Date(),
                }
              : user;
          })
        );
      }
    });

    // Listen for member removal events
    socketService.socket?.on('member_removed', (payload) => {
      console.log('👤 Member removed event received:', payload);
      const { systemMessage, removedMemberId, groupId } = payload;
      
      if (!systemMessage || !groupId) return;

      // Add system message to the chat
      setMessages((prevMessages) => ({
        ...prevMessages,
        [groupId]: [...(prevMessages[groupId] || []), systemMessage],
      }));

      // If current user was removed, remove the group from their list
      const currentUserId = currentUser?._id || currentUser?.id;
      if (removedMemberId === currentUserId) {
        setGroups((prevGroups) =>
          prevGroups.filter((group) => group._id !== groupId)
        );
        
        // If the removed user was viewing this group, clear the selection
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
          setCurrentConversation(null);
        }
      }
    });

    // Listen for member addition events
    socketService.socket?.on('member_added', (payload) => {
      console.log('👥 Member added event received:', payload);
      const { systemMessage, addedMemberIds, groupId } = payload;
      
      if (!systemMessage || !groupId) return;

      // Add system message to the chat
      setMessages((prevMessages) => ({
        ...prevMessages,
        [groupId]: [...(prevMessages[groupId] || []), systemMessage],
      }));
    });

    // Listen for block events
    socketService.socket?.on('user_blocked', async (payload) => {
      console.log('🚫 User blocked event received:', payload);
      const { blockerId, blockedUserId } = payload;
      
      // If the current chat is affected, update block status
      if (selectedUser) {
        const selectedUserId = selectedUser._id || selectedUser.id;
        const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        const currentUserId = storedUser._id || storedUser.id;
        
        // Check if this block event involves the current chat
        if ((blockerId === currentUserId || blockedUserId === currentUserId) && 
            (selectedUserId === blockerId || selectedUserId === blockedUserId)) {
          // Fetch updated block status
          const status = await userService.checkBlockStatus(selectedUserId);
          setBlockStatus(status);
        }
      }
    });

    socketService.socket?.on('user_unblocked', async (payload) => {
      console.log('✅ User unblocked event received:', payload);
      const { unblockerId, unblockedUserId } = payload;
      
      // If the current chat is affected, update block status
      if (selectedUser) {
        const selectedUserId = selectedUser._id || selectedUser.id;
        const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
        const currentUserId = storedUser._id || storedUser.id;
        
        // Check if this unblock event involves the current chat
        if ((unblockerId === currentUserId || unblockedUserId === currentUserId) && 
            (selectedUserId === unblockerId || selectedUserId === unblockedUserId)) {
          // Fetch updated block status
          const status = await userService.checkBlockStatus(selectedUserId);
          setBlockStatus(status);
        }
      }
    });

    // Don't disconnect socket here - just cleanup listeners
    return () => {
      socketService.offReceiveMessage();
      socketService.offProfileUpdate();
      socketService.offMessagesSeen();
      socketService.offUserOnline();
      socketService.offUserOffline();
      socketService.offReactionAdded();
      socketService.offReactionRemoved();
      socketService.socket?.off('group_created');
      socketService.socket?.off('group_deleted');
      socketService.socket?.off('message_deleted');
      socketService.socket?.off('member_removed');
      socketService.socket?.off('member_added');
      socketService.socket?.off('user_blocked');
      socketService.socket?.off('user_unblocked');
    };
  }, [currentConversation, currentUser, selectedGroup, selectedUser]); // Re-setup listeners when conversation changes

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(uiSettings));
  }, [uiSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUTED_CONVERSATIONS, JSON.stringify(mutedConversations));
  }, [mutedConversations]);

  const handleToggleMuteConversation = (conversationId) => {
    const normalizedId = conversationId?.toString();
    if (!normalizedId) {
      console.warn('⚠️ Cannot toggle mute: missing conversation ID');
      return;
    }

    setMutedConversations((prev) => {
      if (prev.includes(normalizedId)) {
        // Unmute
        return prev.filter(id => id !== normalizedId);
      } else {
        // Mute
        return [...prev, normalizedId];
      }
    });
  };

  const isConversationMuted = (conversationId) => {
    const normalizedId = conversationId?.toString();
    return normalizedId ? mutedConversations.includes(normalizedId) : false;
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const currentUserId = storedUser._id || storedUser.id;
      const targetUserId = user._id || user.id;
      
      // Fetch block status for this user (skip for bots)
      if (!user.isBot) {
        const status = await userService.checkBlockStatus(targetUserId);
        setBlockStatus(status);
      } else {
        setBlockStatus(null);
      }
      
      // Start or find conversation
      const convRes = await conversationService.startConversation([currentUserId, targetUserId], false);
      const conversation = convRes.conversation;
      setCurrentConversation(conversation);

      // Join socket room
      console.log('🔌 Joining socket room:', conversation._id);
      socketService.joinConversation(conversation._id);

      // Fetch messages for this conversation
      const messagesRes = await messageService.getMessages(conversation._id);
      const fetchedMessages = messagesRes.messages || [];
      setMessages((prev) => ({
        ...prev,
        [conversation._id]: fetchedMessages,
      }));

      // Mark conversation as read via API
      messageService.markConversationAsRead(conversation._id)
        .then((res) => {
          console.log('✅ Conversation marked as read:', res.modifiedCount, 'messages');
          // Update messages with seen status
          if (res.messages) {
            setMessages((prev) => ({
              ...prev,
              [conversation._id]: res.messages,
            }));
          }
        })
        .catch(err => console.error('Failed to mark conversation as read:', err));

      // Emit socket event to notify sender
      socketService.emitMarkAsRead({
        conversationId: conversation._id,
        userId: currentUserId
      });

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id || item.id === user.id
            ? { ...item, unreadCount: 0 }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setBlockStatus(null); // Clear block status for groups
    
    try {
      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const currentUserId = storedUser._id || storedUser.id;
      
      // Group conversation handling - groups have their own conversation ID
      const conversation = { _id: group._id, isGroup: true, members: group.members };
      setCurrentConversation(conversation);

      // Join socket room for this group
      socketService.joinConversation(group._id);

      // Fetch messages for this group
      const messagesRes = await messageService.getMessages(group._id);
      const fetchedMessages = messagesRes.messages || [];
      setMessages((prev) => ({
        ...prev,
        [group._id]: fetchedMessages,
      }));

      // Mark all unread messages as read
      const messagesToMark = fetchedMessages.filter(msg => {
        const isUnread = !msg.readBy || !msg.readBy.includes(currentUserId);
        const isNotOwnMessage = (msg.sender?._id || msg.sender) !== currentUserId;
        return isUnread && isNotOwnMessage;
      });

      if (messagesToMark.length > 0) {
        Promise.all(
          messagesToMark.map(msg => messageService.markMessageAsRead(msg._id || msg.id))
        ).then((responses) => {
          setMessages((prev) => {
            const updatedMessages = [...(prev[group._id] || [])];
            responses.forEach(res => {
              if (res.message) {
                const index = updatedMessages.findIndex(m => (m._id || m.id) === (res.message._id || res.message.id));
                if (index >= 0) {
                  updatedMessages[index] = res.message;
                }
              }
            });
            return {
              ...prev,
              [group._id]: updatedMessages,
            };
          });
        }).catch(err => console.error('Failed to mark messages as read:', err));
      }

      setGroups((prevGroups) =>
        prevGroups.map((item) =>
          item._id === group._id
            ? { ...item, unreadCount: 0 }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to load group conversation:', error);
    }
  };

  const handleSendMessage = (text, attachments = []) => {
    if (!currentConversation) return;
    if (!text?.trim() && attachments.length === 0) return;

    const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    const conversationId = currentConversation._id;
    
    // Create optimistic message object to show immediately
    const optimisticMessage = {
      _id: `temp_${Date.now()}`, // Temporary ID
      sender: currentUser || storedUser,
      conversationId,
      text: text || '',
      attachments: [], // Will be filled after upload
      createdAt: new Date().toISOString(),
      readBy: [currentUser?._id || storedUser?._id],
      status: 'sending', // Mark as pending
    };

    // Update UI immediately (optimistic update)
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [
        ...(prev[conversationId] || []),
        optimisticMessage,
      ],
    }));

    const lastMessagePreview = text || '';
    const senderName = currentUser?.name || storedUser?.name || 'You';
    
    if (currentConversation.isGroup || selectedGroup) {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === conversationId
            ? {
                ...group,
                lastMessage: lastMessagePreview,
                lastMessageTime: new Date().toISOString(),
                lastMessageSender: senderName,
              }
            : group
        )
      );
    } else if (selectedUser) {
      const selectedUserId = selectedUser._id || selectedUser.id;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          (user._id === selectedUserId || user.id === selectedUserId)
            ? {
                ...user,
                lastMessage: lastMessagePreview,
                lastMessageTime: new Date().toISOString(),
              }
            : user
        )
      );
    }

    // Send message in background without blocking UI
    (async () => {
      try {
        let attachmentData = [];
        
        // Upload files if there are any
        if (attachments.length > 0) {
          console.log('📤 Uploading files:', attachments.length);
          
          setIsUploading(true);
          setUploadProgress(0);
          
          try {
            if (attachments.length === 1) {
              const response = await uploadAPI.uploadSingleFile(attachments[0], (progress) => {
                setUploadProgress(progress);
              });
              attachmentData = [response.data.file];
            } else {
              const response = await uploadAPI.uploadMultipleFiles(attachments, (progress) => {
                setUploadProgress(progress);
              });
              attachmentData = response.data.files;
            }
            
            console.log('✅ Files uploaded:', attachmentData);
          } catch (uploadError) {
            console.error('❌ Upload failed:', uploadError);
            // Remove optimistic message on upload failure
            setMessages((prev) => ({
              ...prev,
              [conversationId]: (prev[conversationId] || []).filter(
                msg => msg._id !== optimisticMessage._id
              ),
            }));
            setIsUploading(false);
            setUploadProgress(0);
            return;
          } finally {
            setIsUploading(false);
            setUploadProgress(0);
          }
        }
        
        // Send message to backend
        console.log('📨 Sending message to backend...');
        const msgRes = await messageService.sendMessage(
          conversationId, 
          text, 
          attachmentData
        );
        console.log('✅ Message sent to backend:', msgRes.message?._id);
        const newMessage = msgRes.message;

        // Replace optimistic message with real one from server
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((msg) =>
            msg._id === optimisticMessage._id ? newMessage : msg
          ),
        }));

        // Emit via socket for real-time delivery
        socketService.sendMessage({
          conversationId,
          message: newMessage,
        });

        const lastMessageTime = newMessage.createdAt || newMessage.timestamp || new Date().toISOString();
        const lastMessagePreview = createMessagePreview(newMessage);
        
        if (currentConversation.isGroup || selectedGroup) {
          setGroups((prevGroups) =>
            prevGroups.map((group) =>
              group._id === conversationId
                ? {
                    ...group,
                    lastMessage: lastMessagePreview,
                    lastMessageTime,
                    lastMessageSender: newMessage.sender?.name || senderName,
                  }
                : group
            )
          );
        } else if (selectedUser) {
          const selectedUserId = selectedUser._id || selectedUser.id;
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              (user._id === selectedUserId || user.id === selectedUserId)
                ? {
                    ...user,
                    lastMessage: lastMessagePreview,
                    lastMessageTime,
                  }
                : user
            )
          );
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        // Remove optimistic message on error
        setMessages((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).filter(
            msg => msg._id !== optimisticMessage._id
          ),
        }));
      }
    })();
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || !currentConversation) return;

    try {
      await messageService.deleteMessage(messageId);
      
      // Remove message from local state and get updated messages
      let updatedMessages = [];
      setMessages((prev) => {
        const filtered = (prev[currentConversation._id] || []).filter(
          msg => (msg._id || msg.id) !== messageId
        );
        updatedMessages = filtered;
        return {
          ...prev,
          [currentConversation._id]: filtered,
        };
      });

      // Update sidebar preview with the actual last message
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      const lastMessagePreview = lastMessage ? createMessagePreview(lastMessage) : '';
      const lastMessageTime = lastMessage 
        ? (lastMessage.createdAt || lastMessage.timestamp || new Date().toISOString())
        : new Date().toISOString();

      // Update groups or users list with new last message
      if (currentConversation.isGroup || selectedGroup) {
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === currentConversation._id
              ? {
                  ...group,
                  lastMessage: lastMessagePreview,
                  lastMessageTime,
                }
              : group
          )
        );
      } else if (selectedUser) {
        const selectedUserId = selectedUser._id || selectedUser.id;
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            const userId = user._id || user.id;
            const shouldUpdate = userId && selectedUserId && userId === selectedUserId;
            return shouldUpdate
              ? {
                  ...user,
                  lastMessage: lastMessagePreview,
                  lastMessageTime,
                }
              : user;
          })
        );
      }

      console.log('✅ Message deleted:', messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleBlockUser = async (userId) => {
    if (!userId) return;

    try {
      await userService.blockUser(userId);
      console.log('✅ User blocked:', userId);
      
      // Fetch updated block status
      const status = await userService.checkBlockStatus(userId);
      setBlockStatus(status);
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!userId) return;

    try {
      await userService.unblockUser(userId);
      console.log('✅ User unblocked:', userId);
      
      // Fetch updated block status
      const status = await userService.checkBlockStatus(userId);
      setBlockStatus(status);
    } catch (error) {
      console.error('Failed to unblock user:', error);
    }
  };

  const handleOpenChatbot = () => {
    const aiAssistant = users.find(u => u.isBot);
    if (aiAssistant) {
      handleSelectUser(aiAssistant);
    }
  };

  const handleFavoriteToggle = (userId, isFavorite) => {
    // Update the users list to reflect the favorite status
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        const userIdStr = user._id?.toString?.() || user._id;
        const userIdToCheck = typeof userId === 'string' ? userId : userId.toString?.();
        
        if (userIdStr === userIdToCheck) {
          return { ...user, isFavorite };
        }
        return user;
      })
    );
  };

  const handleGroupFavoriteToggle = async (groupId, currentFavoriteState) => {
    try {
      // Toggle the favorite in backend
      const response = await userService.toggleFavoriteConversation(groupId);
      const newFavoriteState = response.isFavorited;

      // Update the groups list to reflect the favorite status
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          const groupIdStr = group._id?.toString?.() || group._id;
          const groupIdToCheck = typeof groupId === 'string' ? groupId : groupId.toString?.();
          
          if (groupIdStr === groupIdToCheck) {
            return { ...group, isFavorite: newFavoriteState };
          }
          return group;
        })
      );

      // Update selectedGroup if it's the one being toggled
      if (selectedGroup && (selectedGroup._id === groupId || selectedGroup.id === groupId)) {
        setSelectedGroup((prev) => ({ ...prev, isFavorite: newFavoriteState }));
      }

      console.log('✅ Group favorite toggled:', { groupId, newFavoriteState });
    } catch (error) {
      console.error('❌ Failed to toggle group favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const handleClearChat = async () => {
    if (!currentConversation) return;

    try {
      await messageService.clearConversation(currentConversation._id);

      setMessages((prev) => ({
        ...prev,
        [currentConversation._id]: [],
      }));
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const handleLeaveGroup = () => {
    setIsLeaveGroupDialogOpen(true);
  };

  const confirmLeaveGroup = async () => {
    if (!selectedGroup) return;

    try {
      const groupId = selectedGroup._id || selectedGroup.id;
      await conversationService.leaveGroup(groupId);

      // Remove group from groups list
      setGroups((prev) => prev.filter(
        (g) => (g._id || g.id) !== groupId
      ));

      // Clear messages for this group
      setMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[groupId];
        return newMessages;
      });

      // Clear selection
      setSelectedGroup(null);
      setCurrentConversation(null);
      setIsLeaveGroupDialogOpen(false);
    } catch (error) {
      console.error('Failed to leave group:', error);
      setIsLeaveGroupDialogOpen(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      console.log('🗑️ Attempting to delete group:', groupId);
      
      // Call API to delete the group from backend
      const result = await conversationService.deleteGroup(groupId);
      
      console.log('✅ Group deleted from backend:', result);
      
      // Optimistically update local state (socket event will also trigger update)
      setGroups((prev) => {
        const filtered = prev.filter((g) => (g._id || g.id) !== groupId);
        console.log('🔄 Local state updated. Before:', prev.length, 'After:', filtered.length);
        return filtered;
      });

      // Clear messages for this group
      setMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[groupId];
        return newMessages;
      });

      // Clear selection if this group is selected
      if (selectedGroup?._id === groupId || selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setCurrentConversation(null);
      }
      
      setIsProfileOpen(false);
    } catch (error) {
      console.error('❌ Failed to delete group:', error);
      
      if (error.response?.status === 404) {
        // Group already deleted, just update local state
        console.log('⚠️ Group not found in backend (already deleted), updating local state only');
        setGroups((prev) => prev.filter((g) => (g._id || g.id) !== groupId));
        setMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[groupId];
          return newMessages;
        });
        if (selectedGroup?._id === groupId || selectedGroup?.id === groupId) {
          setSelectedGroup(null);
          setCurrentConversation(null);
        }
        setIsProfileOpen(false);
        alert('Group was already deleted. Your view has been updated.');
      } else {
        alert('Failed to delete group. ' + (error.response?.data?.message || error.message || 'Please try again'));
      }
    }
  };

  const handleGroupUpdate = (updatedGroup) => {
    console.log('🔄 Group updated:', updatedGroup);
    
    // Update the groups list
    setGroups((prevGroups) => 
      prevGroups.map((g) => 
        (g._id || g.id) === (updatedGroup._id || updatedGroup.id) 
          ? { ...g, ...updatedGroup }
          : g
      )
    );
    
    // Update selectedGroup if it's the one being updated
    if (selectedGroup && (selectedGroup._id === updatedGroup._id || selectedGroup.id === updatedGroup.id)) {
      setSelectedGroup((prev) => ({ ...prev, ...updatedGroup }));
    }
  };

  const handleCreateGroup = async (groupName, memberIds, groupDescription = '') => {
    try {
      const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
      const currentUserId = storedUser._id || storedUser.id;

      // Create group via API
      const createRes = await conversationService.createGroup(groupName, memberIds, groupDescription);
      const newGroup = createRes.group;

      // Add to groups state with defaults
      const enrichedGroup = {
        ...newGroup,
        lastMessage: '',
        lastMessageTime: null,
        lastMessageSender: '',
        memberCount: newGroup.members?.length || 0,
        unreadCount: 0,
      };

      setGroups((prevGroups) => [...prevGroups, enrichedGroup]);

      // Select the newly created group
      setSelectedGroup(enrichedGroup);
      setSelectedUser(null);

      // Set conversation and join socket room
      socketService.joinConversation(newGroup._id);
      const conversation = {
        _id: newGroup._id,
        isGroup: true,
        members: newGroup.members,
        name: newGroup.name,
      };
      setCurrentConversation(conversation);

      // Fetch messages for this group (should be empty for new group)
      const messagesRes = await messageService.getMessages(newGroup._id);
      const fetchedMessages = messagesRes.messages || [];
      setMessages((prev) => ({
        ...prev,
        [newGroup._id]: fetchedMessages,
      }));

      // Mark conversation as read via API
      messageService.markConversationAsRead(newGroup._id)
        .catch(err => console.error('Failed to mark conversation as read:', err));

      // Emit socket event
      socketService.emitMarkAsRead({
        conversationId: newGroup._id,
        userId: currentUserId
      });

      // Close contacts modal
      setIsContactsOpen(false);
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear any stored auth data
    navigate(ROUTES.LOGIN);
  };

  const handleTyping = (isTyping) => {
    if (!currentConversation) return;
    
    const storedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const userId = storedUser._id || storedUser.id;
    
    if (isTyping) {
      socketService.sendTyping({
        conversationId: currentConversation._id,
        userId: userId,
      });
    } else {
      socketService.sendStopTyping({
        conversationId: currentConversation._id,
        userId: userId,
      });
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#022C22] flex relative">
      {/* Left Panel - Sidebar or Own Profile Panel */}
      {isOwnProfileOpen && currentUser ? (
        <div className="w-96 h-full flex flex-col border-r border-[#10B981]/20 shadow-xl">
          <OwnProfilePanel
            user={currentUser}
            onClose={() => setIsOwnProfileOpen(false)}
            settings={uiSettings}
            onUpdateSettings={setUiSettings}
          />
        </div>
      ) : (
        <Sidebar
          users={users}
          groups={groups}
          onlineUsers={onlineUsers}
          currentUser={currentUser}
          selectedUserId={selectedUser?._id}
          onSelectUser={handleSelectUser}
          selectedGroupId={selectedGroup?._id}
          onSelectGroup={handleSelectGroup}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsOwnProfileOpen(true)}
          onOpenContacts={() => {
            setIsContactsOpen(true);
            setIsCreateGroupMode(false);
          }}
          onOpenCreateGroup={() => {
            setIsContactsOpen(true);
            setIsCreateGroupMode(true);
          }}
          showPreview={uiSettings.previews}
          compactMode={uiSettings.compactMode}
        />
      )}

      {/* Right Panel - Chat Window */}
      {/* When isOwnProfileOpen, clear selectedUser to show empty state */}
      <ChatWindow
        currentConversation={currentConversation}
        selectedUser={isOwnProfileOpen ? null : selectedUser}
        selectedGroup={isOwnProfileOpen ? null : selectedGroup}
        messages={currentConversation ? (messages[currentConversation._id] || []) : []}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
        onBlockUser={handleBlockUser}
        onUnblockUser={handleUnblockUser}
        blockStatus={blockStatus}
        onClearChat={handleClearChat}
        onTyping={handleTyping}
        typingUsers={typingUsers}
        onlineUsers={onlineUsers}
        onOpenProfile={() => setIsProfileOpen(true)}
        onCloseProfile={() => setIsProfileOpen(false)}
        isProfileOpen={isProfileOpen}
        currentUser={currentUser}
        compactMode={uiSettings.compactMode}
        onOpenChatbot={handleOpenChatbot}
        onFavoriteToggle={handleFavoriteToggle}
        onGroupFavoriteToggle={handleGroupFavoriteToggle}
        onLeaveGroup={handleLeaveGroup}
        allUsers={users}
        onDeleteGroup={handleDeleteGroup}
        onGroupUpdate={handleGroupUpdate}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        isMuted={isConversationMuted(currentConversation?._id)}
        onMuteConversation={handleToggleMuteConversation}
      />



      <ContactsModal
        isOpen={isContactsOpen}
        onClose={() => {
          setIsContactsOpen(false);
          setIsCreateGroupMode(false);
        }}
        users={users}
        onSelectUser={(user) => {
          handleSelectUser(user);
          setIsContactsOpen(false);
        }}
        onCreateGroup={handleCreateGroup}
        initialCreateMode={isCreateGroupMode}
        currentUser={currentUser}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={uiSettings}
        onUpdate={setUiSettings}
      />

      <ConfirmDialog
        isOpen={isLeaveGroupDialogOpen}
        title="Leave Group"
        message="Are you sure you want to leave this group? You will no longer be able to see or send messages in this group."
        confirmText="Leave Group"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmLeaveGroup}
        onCancel={() => setIsLeaveGroupDialogOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
