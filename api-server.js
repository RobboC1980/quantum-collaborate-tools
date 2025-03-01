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
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your frontend URLs
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
  const requiredVars = ['QWEN_API_KEY', 'QWEN_API_URL', 'QWEN_MODEL'];
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
    console.log('📤 Forwarding request to QWEN API: /completions');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const apiKey = process.env.QWEN_API_KEY;
    const apiUrl = process.env.QWEN_API_URL;
    
    if (!apiKey || !apiUrl) {
      throw new Error('QWEN API key or URL not configured');
    }
    
    const model = req.body.model || process.env.QWEN_MODEL || 'qwen-max';
    
    // Set a longer timeout for larger generations (120 seconds)
    const timeout = 120000;
    
    console.log(`📡 Sending request to ${apiUrl}/completions with ${timeout/1000}s timeout`);
    
    const response = await axios.post(`${apiUrl}/completions`, {
      ...req.body,
      model: model
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: timeout // Increase timeout for larger generations
    });
    
    console.log('📥 Received response from QWEN API:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('❌ QWEN API Error:', error.message);
    
    // Detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      res.status(error.response.status).json({
        error: 'QWEN API Error',
        message: error.message,
        details: error.response.data
      });
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout explicitly
      console.error('API request timed out after waiting for response');
      res.status(504).json({
        error: 'QWEN API Timeout',
        message: 'The request to the AI service timed out. The model might be overloaded or the request is too complex.',
        details: error.message
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      res.status(504).json({
        error: 'QWEN API Timeout',
        message: 'No response received from QWEN API',
        details: error.message
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      res.status(500).json({
        error: 'QWEN API Request Failed',
        message: error.message
      });
    }
  }
});

app.post('/api/qwen/embeddings', async (req, res) => {
  try {
    console.log('📤 Forwarding request to QWEN API: /embeddings');
    
    const apiKey = process.env.QWEN_API_KEY;
    const apiUrl = process.env.QWEN_API_URL;
    const model = req.body.model || process.env.QWEN_EMBEDDING_MODEL || 'text-embedding-ada-002';
    
    const response = await axios.post(`${apiUrl}/embeddings`, {
      ...req.body,
      model: model
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('📥 Received response from QWEN API:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('❌ QWEN API Error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'QWEN API Error',
        message: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        error: 'QWEN API Request Failed',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  validateEnvVars();
  console.log(`✅ API Proxy server running at http://localhost:${PORT}`);
  console.log(`📡 QWEN API URL: ${process.env.QWEN_API_URL}`);
  console.log(`🔑 QWEN API Key: ${process.env.QWEN_API_KEY ? '***configured***' : 'MISSING!'}`);
  console.log(`🤖 QWEN Model: ${process.env.QWEN_MODEL || 'default'}`);
});

// Handle server errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 