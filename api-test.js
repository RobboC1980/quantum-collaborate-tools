const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test DashScope API connection
async function testDashScopeAPI() {
  console.log('🧪 Testing DashScope API connection...');
  
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const apiUrl = process.env.QWEN_API_URL;
  const model = process.env.QWEN_MODEL || 'qwen-plus';
  
  if (!apiKey) {
    console.error('❌ Error: DASHSCOPE_API_KEY is not set in your .env file');
    return;
  }
  
  if (!apiUrl) {
    console.error('❌ Error: QWEN_API_URL is not set in your .env file');
    return;
  }
  
  console.log(`Using URL: ${apiUrl}`);
  console.log(`Using model: ${model}`);
  
  try {
    console.log(`📡 Sending test request to ${apiUrl}/chat/completions`);
    
    // Using the correct DashScope chat API format
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: "Say hello in a short sentence." }
      ],
      max_tokens: 20,
      temperature: 0.7,
      stream: false
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(`${apiUrl}/chat/completions`, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ Response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(response.data, null, 2)}`);
    
    // Extract the response text
    const responseText = response.data.choices[0]?.message?.content || '';
    console.log(`   Response Text: "${responseText}"`);
    
    console.log('The API connection is working!');
    return true;
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
    console.error('2. The API URL is correct (should end with /compatible-mode/v1)');
    console.error('3. The model name is correct (try qwen-plus)');
    console.error('4. Your network connection');
    console.error('5. The API service is available');
    
    return false;
  }
}

// Now also test our proxy server
async function testProxyServer() {
  console.log('\n🧪 Testing local proxy server...');
  
  try {
    // First check if server is running
    const healthResponse = await axios.get('http://localhost:8081/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Then test the completions endpoint
    console.log('📡 Testing proxy completions endpoint...');
    
    const response = await axios.post('http://localhost:8081/api/qwen/completions', {
      prompt: 'Say hello briefly.',
      max_tokens: 20
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Proxy response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Text: "${response.data.choices[0]?.text}"`);
    console.log('The proxy server is working!');
    return true;
  } catch (error) {
    console.error('❌ Proxy Test Failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('The proxy server is not running. Start it with: npm run api-server');
    } else if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  try {
    const apiSuccess = await testDashScopeAPI();
    const proxySuccess = await testProxyServer();
    
    if (apiSuccess && proxySuccess) {
      console.log('\n✅ All tests passed! Your AI integration is working correctly.');
    } else {
      console.error('\n❌ Some tests failed. Please fix the issues before proceeding.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests(); 