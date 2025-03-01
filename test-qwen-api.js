import axios from 'axios';

async function testQwenApi() {
  try {
    console.log('Testing Qwen API through our proxy server...');
    
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3002/api/qwen/chat/completions',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: 'Hello, who are you?' }
        ]
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing Qwen API:', error.message);
    
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
    }
  }
}

testQwenApi(); 