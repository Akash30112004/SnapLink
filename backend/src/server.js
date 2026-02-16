const http = require('http');
const path = require('path');

// Load .env FIRST before anything else
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Log to verify env is loaded
console.log('🔧 Environment loaded:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
  PORT: process.env.PORT || 'NOT SET'
});

const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./config/socket');
const ensureBotUser = require('./utils/ensureBotUser');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureBotUser();

  const server = http.createServer(app);

  const io = initSocket(server);
  
  // Attach io to app for access in controllers
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
