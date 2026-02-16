// Using direct fetch instead of the SDK due to timeout issues
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

console.log('Gemini Key Loaded:', !!GEMINI_API_KEY);
console.log('Gemini Model:', GEMINI_MODEL);

const generateContent = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  console.log('🔵 Making Gemini API call to:', GEMINI_MODEL);
  console.log('🔵 Prompt:', prompt.substring(0, 50) + '...');
  
  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout for axios
    });

    console.log('🟢 Got response, status:', response.status);

    const data = response.data;
    console.log('🟢 Response parsed successfully');
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('🔴 Invalid response format:', JSON.stringify(data).substring(0, 200));
      throw new Error('Invalid API response format');
    }

    const aiText = data.candidates[0].content.parts[0].text;
    console.log('✅ AI Reply:', aiText.substring(0, 50) + '...');

    return {
      response: {
        text: () => aiText
      }
    };
  } catch (error) {
    console.error('🔴 Axios error in generateContent:', error.message);
    if (error.response) {
      console.error('🔴 Response data:', error.response.data);
    }
    throw error;
  }
};

module.exports = {
  generateContent,
  GEMINI_API_KEY,
  GEMINI_MODEL
};
