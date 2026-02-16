const { generateAIReply, testOllamaConnection, testGeneration } = require('../services/aiService');

const getAIReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('User message:', message);

    const reply = await generateAIReply(message);

    console.log('AI reply:', reply);

    return res.json({ reply });
  } catch (error) {
    console.error('AI Error:', error.message);
    return res.status(500).json({
      reply: 'AI is unavailable right now. Please try again later.',
      error: error.message,
    });
  }
};

const testAI = async (req, res) => {
  try {
    console.log('🧪 Testing Ollama AI...');
    const reply = await testGeneration();
    console.log('🧪 Test successful:', reply);
    return res.send(reply);
  } catch (error) {
    console.error('AI test failed:', error.message);
    return res.status(500).json({
      message: 'AI test failed',
      error: error.message,
    });
  }
};

const checkAIStatus = async (req, res) => {
  try {
    const isAvailable = await testOllamaConnection();
    
    if (isAvailable) {
      return res.status(200).json({
        status: 'online',
        message: 'Ollama AI service is running',
      });
    } else {
      return res.status(503).json({
        status: 'offline',
        message: 'Ollama AI service is not available',
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check AI status',
      error: error.message,
    });
  }
};

module.exports = {
  getAIReply,
  testAI,
  checkAIStatus,
};
