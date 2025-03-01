import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3001; // Hard-code port 3001 to match client expectations

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Attempt to load environment variables from .env file if it exists
let QWEN_API_KEY = process.env.VITE_QWEN_API_KEY;
try {
  if (fs.existsSync(path.join(process.cwd(), '.env'))) {
    const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    console.log('Found .env file, contents:', envFile);
    const qwenKeyMatch = envFile.match(/VITE_QWEN_API_KEY=(.+)/);
    if (qwenKeyMatch && qwenKeyMatch[1]) {
      QWEN_API_KEY = qwenKeyMatch[1];
      console.log('Extracted API key from .env file:', QWEN_API_KEY.substring(0, 5) + '...');
    }
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Fallback to hardcoded value if no API key found
QWEN_API_KEY = QWEN_API_KEY || 'sk-b2ead61191a9467f89d69cb540ee3005';

console.log('API proxy server is using API key:', QWEN_API_KEY.substring(0, 5) + '...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Specific endpoint for chat completions
app.post('/api/qwen/chat/completions', async (req, res) => {
  try {
    console.log('Received request to /api/qwen/chat/completions');
    console.log('Request model:', req.body.model);
    
    // Map OpenAI-compatible model names to Qwen model names
    const modelMap = {
      'qwen-max': 'qwen-max',
      'qwen-plus': 'qwen-plus',
      'qwen-turbo': 'qwen-turbo',
      'qwen-lite': 'qwen-lite',
      'qwen2.5-72b-instruct': 'qwen2.5-72b-instruct',
      'qwen2.5-14b-instruct-1m': 'qwen2.5-14b-instruct-1m',
      'qwen2.5-vl-72b-instruct': 'qwen2.5-vl-72b-instruct'
    };
    
    // Use the mapped model or the original if not in the map
    const qwenModel = modelMap[req.body.model] || req.body.model;
    
    // Create a properly formatted request for Qwen API
    const qwenRequest = {
      model: qwenModel,
      messages: req.body.messages,
      temperature: req.body.temperature || 0.7,
      top_p: req.body.top_p || 0.8,
      max_tokens: req.body.max_tokens || 1500
    };
    
    // Add response_format if specified in the original request
    if (req.body.response_format) {
      if (req.body.response_format.type === 'json_object') {
        qwenRequest.response_format = { type: 'json_object' };
      }
    }
    
    console.log('Formatted request for Qwen API:', JSON.stringify(qwenRequest, null, 2));
    console.log('Using API endpoint:', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions');
    console.log('Using API key:', QWEN_API_KEY.substring(0, 5) + '...');
    
    const response = await axios({
      method: 'post',
      url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: qwenRequest
    });
    
    console.log('Qwen API response status:', response.status);
    
    // Return the response directly as it should already be in OpenAI-compatible format
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Qwen API:', error.message);
    
    if (error.response) {
      console.error('Qwen API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: `Qwen API Error: ${error.response.data.message || error.message}`,
          type: error.response.data.code || 'api_error',
          param: null,
          code: error.response.status
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: `Internal server error: ${error.message}`,
        type: 'internal_error',
        param: null,
        code: 500
      }
    });
  }
});

// Generic handler for other Qwen API paths
app.post('/api/qwen/*', async (req, res) => {
  try {
    console.log(`Proxying request to Qwen API: ${req.path}`);
    console.log('Request model:', req.body.model);
    
    // Map OpenAI-compatible model names to Qwen model names
    const modelMap = {
      'qwen-max': 'qwen-max',
      'qwen-plus': 'qwen-plus',
      'qwen-turbo': 'qwen-turbo',
      'qwen-lite': 'qwen-lite',
      'qwen2.5-72b-instruct': 'qwen2.5-72b-instruct',
      'qwen2.5-14b-instruct-1m': 'qwen2.5-14b-instruct-1m',
      'qwen2.5-vl-72b-instruct': 'qwen2.5-vl-72b-instruct'
    };
    
    // Use the mapped model or the original if not in the map
    const qwenModel = modelMap[req.body.model] || req.body.model;
    
    // Create a properly formatted request for Qwen API
    const qwenRequest = {
      model: qwenModel,
      messages: req.body.messages,
      temperature: req.body.temperature || 0.7,
      top_p: req.body.top_p || 0.8,
      max_tokens: req.body.max_tokens || 1500
    };
    
    // Add response_format if specified in the original request
    if (req.body.response_format) {
      if (req.body.response_format.type === 'json_object') {
        qwenRequest.response_format = { type: 'json_object' };
      }
    }
    
    console.log('Formatted request for Qwen API:', JSON.stringify(qwenRequest, null, 2));
    console.log('Using API endpoint:', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions');
    console.log('Using API key:', QWEN_API_KEY.substring(0, 5) + '...');
    
    const response = await axios({
      method: 'post',
      url: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: qwenRequest
    });
    
    console.log('Qwen API response status:', response.status);
    
    // Return the response directly
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Qwen API:', error.message);
    
    if (error.response) {
      console.error('Qwen API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: `Qwen API Error: ${error.response.data.message || error.message}`,
          type: error.response.data.code || 'api_error',
          param: null,
          code: error.response.status
        }
      });
    }
    
    res.status(500).json({
      error: {
        message: `Internal server error: ${error.message}`,
        type: 'internal_error',
        param: null,
        code: 500
      }
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API proxy server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
}); 