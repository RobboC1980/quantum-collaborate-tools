const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 8081;

// Essential middleware
app.use(express.json({ limit: '10mb' })); // Increase JSON size limit for image uploads
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Validate environment variables on startup
function validateEnvVars() {
  const requiredVars = ['DASHSCOPE_API_KEY', 'QWEN_API_URL', 'QWEN_MODEL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Error: Missing required environment variables:', missing.join(', '));
    console.error('Please add them to your .env file');
    process.exit(1);
  } else {
    console.log('✅ Environment variables validated');
  }
}

// QWEN API routes
app.post('/api/qwen/completions', async (req, res) => {
  try {
    console.log('📤 Forwarding request to DashScope/QWEN API: /chat/completions');
    
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const apiUrl = process.env.QWEN_API_URL;
    
    if (!apiKey || !apiUrl) {
      throw new Error('DashScope API key or URL not configured');
    }
    
    // Format the request body according to DashScope/QWEN API requirements
    const model = req.body.model || process.env.QWEN_MODEL || 'qwen-plus';
    
    // Log the model being used
    console.log(`Using model: ${model}`);
    
    // Format the request to match DashScope/QWEN API expectations for the OpenAI-compatible API
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes concise, accurate responses.' },
        { role: 'user', content: req.body.prompt || "Hello" }
      ],
      max_tokens: req.body.max_tokens || 800,
      temperature: req.body.temperature || 0.7,
      stream: false // Disable streaming to avoid communication issues
    };
    
    console.log('Formatted request body:', JSON.stringify(requestBody, null, 2));
    
    // Set a longer timeout for larger generations (120 seconds)
    const timeout = 120000;
    
    console.log(`📡 Sending request to ${apiUrl}/chat/completions with ${timeout/1000}s timeout`);
    
    const response = await axios.post(`${apiUrl}/chat/completions`, requestBody, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: timeout
    });
    
    console.log('📥 Received response from DashScope API:', response.status);
    
    // Transform the response to match what our client expects
    const transformedResponse = {
      id: response.data.id || 'dashscope-response',
      object: response.data.object || 'chat.completion',
      created: response.data.created || Date.now(),
      model: response.data.model || model,
      choices: [{
        text: response.data.choices[0]?.message?.content || "",
        index: 0,
        logprobs: null,
        finish_reason: response.data.choices[0]?.finish_reason || "stop"
      }],
      usage: response.data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
    
    // Return response to client
    res.json(transformedResponse);
  } catch (error) {
    console.error('❌ DashScope/QWEN API Error:', error.message);
    
    // Detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      res.status(error.response.status).json({
        error: 'DashScope API Error',
        message: error.message,
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout explicitly
      console.error('API request timed out after waiting for response');
      res.status(504).json({
        error: 'DashScope API Timeout',
        message: 'The request to the AI service timed out. The model might be overloaded or the request is too complex.',
        details: error.message
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      res.status(504).json({
        error: 'DashScope API Timeout',
        message: 'No response received from DashScope API',
        details: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      res.status(500).json({
        error: 'DashScope API Request Failed',
        message: error.message
      });
    }
  }
});

// Handle embeddings via the compatible API
app.post('/api/qwen/embeddings', async (req, res) => {
  try {
    console.log('📤 Forwarding request to DashScope API: /embeddings');
    
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const apiUrl = process.env.QWEN_API_URL;
    const model = req.body.model || process.env.QWEN_EMBEDDING_MODEL || 'text-embedding-ada-002';
    
    const response = await axios.post(`${apiUrl}/embeddings`, {
      model: model,
      input: req.body.input
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('📥 Received response from DashScope API:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('❌ DashScope API Error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'DashScope API Error',
        message: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'DashScope API Request Failed',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      apiUrl: process.env.QWEN_API_URL ? '✅ Configured' : '❌ Missing',
      apiKey: process.env.DASHSCOPE_API_KEY ? '✅ Configured' : '❌ Missing',
      model: process.env.QWEN_MODEL
    }
  });
});

// Start the server
app.listen(PORT, () => {
  validateEnvVars();
  console.log(`✅ API Proxy server running at http://localhost:${PORT}`);
  console.log(`📡 DashScope API URL: ${process.env.QWEN_API_URL}`);
  console.log(`🔑 DashScope API Key: ${process.env.DASHSCOPE_API_KEY ? '***configured***' : 'MISSING!'}`);
  console.log(`🤖 DashScope Model: ${process.env.QWEN_MODEL || 'default'}`);
});

// Handle server errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 