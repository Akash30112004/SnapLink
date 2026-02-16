// Dummy data for testing the chat UI

export const currentUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  status: 'online',
};

export const users = [
  {
    id: 999,
    name: 'AI Assistant',
    email: 'ai@snaplink.io',
    avatar: null,
    status: 'online',
    isBot: true,
    isFavorite: false,
    lastMessage: 'How can I help you today?',
    lastMessageTime: new Date(),
    unreadCount: 0,
  },
  {
    id: 2,
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    avatar: null,
    status: 'online',
    isFavorite: true,
    lastMessage: 'Hey! How are you doing?',
    lastMessageTime: new Date(Date.now() - 5 * 60000), // 5 mins ago
    unreadCount: 2,
  },
  {
    id: 3,
    name: 'Mike Ross',
    email: 'mike@example.com',
    avatar: null,
    status: 'online',
    isFavorite: false,
    lastMessage: 'Did you see the game last night?',
    lastMessageTime: new Date(Date.now() - 30 * 60000), // 30 mins ago
    unreadCount: 0,
  },
  {
    id: 4,
    name: 'Emily Johnson',
    email: 'emily@example.com',
    avatar: null,
    status: 'offline',
    isFavorite: true,
    lastMessage: 'Thanks for your help!',
    lastMessageTime: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    unreadCount: 0,
  },
  {
    id: 5,
    name: 'David Martinez',
    email: 'david@example.com',
    avatar: null,
    status: 'online',
    isFavorite: false,
    lastMessage: 'See you tomorrow!',
    lastMessageTime: new Date(Date.now() - 24 * 3600000), // 1 day ago
    unreadCount: 5,
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    avatar: null,
    status: 'offline',
    isFavorite: false,
    lastMessage: 'Perfect! Let me know when you are free.',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 3600000), // 3 days ago
    unreadCount: 0,
  },
];

export const groups = [
  {
    id: 101,
    name: 'Weekend Warriors',
    avatar: null,
    description: 'Friends who love outdoor adventures and weekend getaways',
    members: [1, 2, 3, 5], // John Doe, Sarah Connor, Mike Ross, David Martinez
    memberCount: 4,
    isFavorite: true,
    lastMessage: 'Who\'s up for hiking this Saturday?',
    lastMessageTime: new Date(Date.now() - 15 * 60000), // 15 mins ago
    lastMessageSender: 'Sarah Connor',
    unreadCount: 3,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000), // 30 days ago
    createdBy: 2, // Sarah Connor
  },
  {
    id: 102,
    name: 'Work Squad',
    avatar: null,
    description: 'Team collaboration and work updates',
    members: [1, 4, 6], // John Doe, Emily Johnson, Lisa Anderson
    memberCount: 3,
    isFavorite: false,
    lastMessage: 'Meeting at 3 PM today',
    lastMessageTime: new Date(Date.now() - 2 * 3600000), // 2 hours ago
    lastMessageSender: 'Emily Johnson',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 60 * 24 * 3600000), // 60 days ago
    createdBy: 4, // Emily Johnson
  },
  {
    id: 103,
    name: 'Game Night Crew',
    avatar: null,
    description: 'Weekly game nights and fun activities',
    members: [1, 2, 3, 5, 6], // Everyone except Emily
    memberCount: 5,
    isFavorite: true,
    lastMessage: 'Board games or video games this week?',
    lastMessageTime: new Date(Date.now() - 24 * 3600000), // 1 day ago
    lastMessageSender: 'Mike Ross',
    unreadCount: 1,
    createdAt: new Date(Date.now() - 45 * 24 * 3600000), // 45 days ago
    createdBy: 3, // Mike Ross
  },
  {
    id: 104,
    name: 'Coffee Lovers ☕',
    avatar: null,
    description: 'For those who can\'t function without caffeine',
    members: [1, 4, 5, 6], // John, Emily, David, Lisa
    memberCount: 4,
    isFavorite: false,
    lastMessage: 'New café opened downtown!',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 3600000), // 3 days ago
    lastMessageSender: 'Lisa Anderson',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 20 * 24 * 3600000), // 20 days ago
    createdBy: 6, // Lisa Anderson
  },
];

export const messages = [
  {
    id: 1,
    senderId: 2,
    text: 'Hey John! How are you?',
    timestamp: new Date(Date.now() - 60 * 60000),
    status: 'read',
  },
  {
    id: 2,
    senderId: 1,
    text: 'Hi Sarah! I\'m doing great, thanks! How about you?',
    timestamp: new Date(Date.now() - 58 * 60000),
    status: 'read',
  },
  {
    id: 3,
    senderId: 2,
    text: 'I\'m good too! Are you free this weekend?',
    timestamp: new Date(Date.now() - 55 * 60000),
    status: 'read',
  },
  {
    id: 4,
    senderId: 1,
    text: 'Yes, I am! Do you have something in mind?',
    timestamp: new Date(Date.now() - 52 * 60000),
    status: 'read',
  },
  {
    id: 5,
    senderId: 2,
    text: 'I was thinking we could go hiking. The weather looks perfect!',
    timestamp: new Date(Date.now() - 50 * 60000),
    status: 'read',
  },
  {
    id: 6,
    senderId: 1,
    text: 'That sounds amazing! I love hiking. What time were you thinking?',
    timestamp: new Date(Date.now() - 45 * 60000),
    status: 'read',
  },
  {
    id: 7,
    senderId: 2,
    text: 'How about 8 AM? We can catch the sunrise from the peak.',
    timestamp: new Date(Date.now() - 40 * 60000),
    status: 'read',
  },
  {
    id: 8,
    senderId: 1,
    text: '8 AM works perfectly! Should I bring anything specific?',
    timestamp: new Date(Date.now() - 35 * 60000),
    status: 'read',
  },
  {
    id: 9,
    senderId: 2,
    text: 'Just water, some snacks, and good hiking shoes. I\'ll handle the rest!',
    timestamp: new Date(Date.now() - 30 * 60000),
    status: 'delivered',
  },
  {
    id: 10,
    senderId: 2,
    text: 'Hey! How are you doing?',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'delivered',
  },
];

export const groupMessages = {
  101: [ // Weekend Warriors
    {
      id: 1001,
      senderId: 2, // Sarah Connor
      senderName: 'Sarah Connor',
      text: 'Hey everyone! Perfect weather this weekend 🌞',
      timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
      status: 'read',
    },
    {
      id: 1002,
      senderId: 3, // Mike Ross
      senderName: 'Mike Ross',
      text: 'I\'m in! Where should we go?',
      timestamp: new Date(Date.now() - 110 * 60000),
      status: 'read',
    },
    {
      id: 1003,
      senderId: 5, // David Martinez
      senderName: 'David Martinez',
      text: 'How about Mount Ridge? The view is spectacular!',
      timestamp: new Date(Date.now() - 90 * 60000),
      status: 'read',
    },
    {
      id: 1004,
      senderId: 1, // John Doe
      senderName: 'John Doe',
      text: 'Mount Ridge sounds great! What time?',
      timestamp: new Date(Date.now() - 70 * 60000),
      status: 'read',
    },
    {
      id: 1005,
      senderId: 2, // Sarah Connor
      senderName: 'Sarah Connor',
      text: 'Let\'s meet at 7 AM at the base. Bring water and snacks!',
      timestamp: new Date(Date.now() - 50 * 60000),
      status: 'read',
    },
    {
      id: 1006,
      senderId: 3, // Mike Ross
      senderName: 'Mike Ross',
      text: 'Perfect! See you all Saturday morning 🎒',
      timestamp: new Date(Date.now() - 30 * 60000),
      status: 'delivered',
    },
    {
      id: 1007,
      senderId: 2, // Sarah Connor
      senderName: 'Sarah Connor',
      text: 'Who\'s up for hiking this Saturday?',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'delivered',
    },
  ],
  102: [ // Work Squad
    {
      id: 2001,
      senderId: 4, // Emily Johnson
      senderName: 'Emily Johnson',
      text: 'Morning team! Quick update on the project',
      timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
      status: 'read',
    },
    {
      id: 2002,
      senderId: 1, // John Doe
      senderName: 'John Doe',
      text: 'Hi Emily! Go ahead',
      timestamp: new Date(Date.now() - 4.5 * 3600000),
      status: 'read',
    },
    {
      id: 2003,
      senderId: 4, // Emily Johnson
      senderName: 'Emily Johnson',
      text: 'We need to finalize the presentation by EOD',
      timestamp: new Date(Date.now() - 4 * 3600000),
      status: 'read',
    },
    {
      id: 2004,
      senderId: 6, // Lisa Anderson
      senderName: 'Lisa Anderson',
      text: 'I can handle the design part',
      timestamp: new Date(Date.now() - 3 * 3600000),
      status: 'read',
    },
    {
      id: 2005,
      senderId: 4, // Emily Johnson
      senderName: 'Emily Johnson',
      text: 'Meeting at 3 PM today',
      timestamp: new Date(Date.now() - 2 * 3600000),
      status: 'delivered',
    },
  ],
  103: [ // Game Night Crew
    {
      id: 3001,
      senderId: 3, // Mike Ross
      senderName: 'Mike Ross',
      text: 'Game night this Friday! 🎮',
      timestamp: new Date(Date.now() - 36 * 3600000), // 1.5 days ago
      status: 'read',
    },
    {
      id: 3002,
      senderId: 2, // Sarah Connor
      senderName: 'Sarah Connor',
      text: 'Count me in! What are we playing?',
      timestamp: new Date(Date.now() - 35 * 3600000),
      status: 'read',
    },
    {
      id: 3003,
      senderId: 5, // David Martinez
      senderName: 'David Martinez',
      text: 'I vote for board games this time',
      timestamp: new Date(Date.now() - 32 * 3600000),
      status: 'read',
    },
    {
      id: 3004,
      senderId: 6, // Lisa Anderson
      senderName: 'Lisa Anderson',
      text: 'I\'ll bring Catan and Ticket to Ride!',
      timestamp: new Date(Date.now() - 28 * 3600000),
      status: 'read',
    },
    {
      id: 3005,
      senderId: 3, // Mike Ross
      senderName: 'Mike Ross',
      text: 'Board games or video games this week?',
      timestamp: new Date(Date.now() - 24 * 3600000),
      status: 'delivered',
    },
  ],
  104: [ // Coffee Lovers
    {
      id: 4001,
      senderId: 6, // Lisa Anderson
      senderName: 'Lisa Anderson',
      text: 'Found the best coffee shop downtown! ☕',
      timestamp: new Date(Date.now() - 4 * 24 * 3600000), // 4 days ago
      status: 'read',
    },
    {
      id: 4002,
      senderId: 1, // John Doe
      senderName: 'John Doe',
      text: 'Tell me more! What\'s it called?',
      timestamp: new Date(Date.now() - 3.8 * 24 * 3600000),
      status: 'read',
    },
    {
      id: 4003,
      senderId: 6, // Lisa Anderson
      senderName: 'Lisa Anderson',
      text: 'Brew & Bean - amazing atmosphere and great lattes',
      timestamp: new Date(Date.now() - 3.5 * 24 * 3600000),
      status: 'read',
    },
    {
      id: 4004,
      senderId: 4, // Emily Johnson
      senderName: 'Emily Johnson',
      text: 'Let\'s do a coffee meetup there!',
      timestamp: new Date(Date.now() - 3.2 * 24 * 3600000),
      status: 'read',
    },
    {
      id: 4005,
      senderId: 6, // Lisa Anderson
      senderName: 'Lisa Anderson',
      text: 'New café opened downtown!',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      status: 'delivered',
    },
  ],
};
