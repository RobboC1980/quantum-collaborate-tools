const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test QWEN API connection
async function testQwenAPI() {
  console.log('🧪 Testing QWEN API connection...');
  
  const apiKey = process.env.QWEN_API_KEY;
  const apiUrl = process.env.QWEN_API_URL;
  
  if (!apiKey) {
    console.error('❌ Error: QWEN_API_KEY is not set in your .env file');
    return;
  }
  
  if (!apiUrl) {
    console.error('❌ Error: QWEN_API_URL is not set in your .env file');
    return;
  }
  
  try {
    console.log(`📡 Sending test request to ${apiUrl}/completions`);
    
    const response = await axios.post(`${apiUrl}/completions`, {
      prompt: 'Say hello in a short sentence.',
      max_tokens: 20,
      model: process.env.QWEN_MODEL || 'qwen-max'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(response.data, null, 2)}`);
    console.log('The API connection is working!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. The request was made but the server did not respond.');
    }
    
    console.error('\nPlease check:');
    console.error('1. Your API key is correct');
    console.error('2. The API URL is correct');
    console.error('3. Your network connection');
    console.error('4. The API service is available');
  }
}

// Run the test
testQwenAPI(); 