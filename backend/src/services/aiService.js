const axios = require('axios');

// Ollama configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10); // 30 seconds

/**
 * Generate AI reply using local Ollama (Llama 3)
 * @param {string} message - User's message
 * @returns {Promise<string>} - AI generated response
 */
const generateAIReply = async (message) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Invalid message: must be a non-empty string');
  }

  const trimmedMessage = message.trim();
  
  console.log('🤖 Ollama AI Request');
  console.log('   Model:', OLLAMA_MODEL);
  console.log('   Prompt:', trimmedMessage.substring(0, 100) + (trimmedMessage.length > 100 ? '...' : ''));
  
  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: trimmedMessage,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: OLLAMA_TIMEOUT,
      }
    );

    console.log('✅ Ollama Response Status:', response.status);

    if (!response.data) {
      throw new Error('Empty response from Ollama');
    }

    // Extract the generated text from Ollama response
    const aiReply = response.data.response;
    
    if (!aiReply || typeof aiReply !== 'string') {
      console.error('❌ Invalid Ollama response format:', response.data);
      throw new Error('Invalid response format from Ollama');
    }

    const trimmedReply = aiReply.trim();
    console.log('✅ AI Reply:', trimmedReply.substring(0, 100) + (trimmedReply.length > 100 ? '...' : ''));
    
    return trimmedReply;
  } catch (error) {
    // Enhanced error handling
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Ollama server is not running at', OLLAMA_URL);
      throw new Error('AI service is currently unavailable. Please ensure Ollama is running.');
    }
    
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      console.error('❌ Ollama request timed out after', OLLAMA_TIMEOUT, 'ms');
      throw new Error('AI service took too long to respond. Please try again.');
    }

    if (error.response) {
      // Ollama returned an error response
      console.error('❌ Ollama API Error:', error.response.status, error.response.data);
      throw new Error(`AI service error: ${error.response.data?.error || 'Unknown error'}`);
    }

    // Generic error
    console.error('❌ Ollama Error:', error.message);
    throw error;
  }
};

/**
 * Test Ollama connection and availability
 * @returns {Promise<boolean>} - True if Ollama is available
 */
const testOllamaConnection = async () => {
  try {
    console.log('🧪 Testing Ollama connection at', OLLAMA_URL);
    
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      console.log('✅ Ollama is running');
      console.log('   Available models:', response.data.models?.map(m => m.name).join(', ') || 'None');
      
      // Check if llama3 model is available
      const hasLlama3 = response.data.models?.some(m => m.name.includes('llama3'));
      if (!hasLlama3) {
        console.warn('⚠️ Warning: llama3 model not found. Available models:', response.data.models?.map(m => m.name));
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Ollama connection test failed:', error.message);
    return false;
  }
};

/**
 * Generate a simple test response
 * @returns {Promise<string>}
 */
const testGeneration = async () => {
  try {
    const testPrompt = 'Say hello in one sentence.';
    const reply = await generateAIReply(testPrompt);
    return reply;
  } catch (error) {
    throw new Error(`Test generation failed: ${error.message}`);
  }
};

module.exports = {
  generateAIReply,
  testOllamaConnection,
  testGeneration,
};
