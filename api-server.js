import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.API_PORT || 8081; // Read from env or default to 8081

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for larger requests
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attempt to load environment variables from .env file if it exists
let QWEN_API_KEY = process.env.QWEN_API_KEY;
let QWEN_API_URL = process.env.QWEN_API_URL || 'https://api.qwen.ai/v1';
let QWEN_MODEL = process.env.QWEN_MODEL || 'qwen2.5-7b-instruct';

try {
  if (fs.existsSync(path.join(process.cwd(), '.env'))) {
    const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    
    // Extract API key
    const qwenKeyMatch = envFile.match(/QWEN_API_KEY=(.+)/);
    if (qwenKeyMatch && qwenKeyMatch[1]) {
      QWEN_API_KEY = qwenKeyMatch[1].trim();
      console.log('Extracted API key from .env file:', QWEN_API_KEY.substring(0, 5) + '...');
    }
    
    // Extract API URL
    const qwenUrlMatch = envFile.match(/QWEN_API_URL=(.+)/);
    if (qwenUrlMatch && qwenUrlMatch[1]) {
      QWEN_API_URL = qwenUrlMatch[1].trim();
      console.log('Using QWEN API URL:', QWEN_API_URL);
    }
    
    // Extract default model
    const qwenModelMatch = envFile.match(/QWEN_MODEL=(.+)/);
    if (qwenModelMatch && qwenModelMatch[1]) {
      QWEN_MODEL = qwenModelMatch[1].trim();
      console.log('Using default QWEN model:', QWEN_MODEL);
    }
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Fallback to hardcoded value if no API key found
QWEN_API_KEY = QWEN_API_KEY || 'sk-b2ead61191a9467f89d69cb540ee3005';

console.log('API proxy server is using API key:', QWEN_API_KEY.substring(0, 5) + '...');
console.log('API proxy server is using API URL:', QWEN_API_URL);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    apiUrl: QWEN_API_URL,
    defaultModel: QWEN_MODEL
  });
});

// Completions endpoint for text generation
app.post('/api/qwen/completions', async (req, res) => {
  try {
    console.log('Received request to /api/qwen/completions');
    
    // Extract the prompt and other parameters
    const { prompt, max_tokens, temperature, top_p, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: {
          message: 'Missing required parameter: prompt',
          type: 'invalid_request_error',
          param: 'prompt',
          code: 400
        }
      });
    }
    
    console.log('Prompt length:', prompt.length);
    console.log('Max tokens:', max_tokens);
    
    // Use system message to improve response format
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant. Respond directly to the user's request without unnecessary preamble or explanation."
      },
      {
        role: "user",
        content: prompt
      }
    ];
    
    // Create a properly formatted request for QWEN API
    const qwenRequest = {
      model: model || QWEN_MODEL,
      messages: messages,
      temperature: temperature || 0.7,
      top_p: top_p || 0.8,
      max_tokens: max_tokens || 1500,
      stream: false
    };
    
    console.log('Using model:', qwenRequest.model);
    
    // Set a reasonable timeout
    const timeout = Math.min(120000, Math.max(30000, max_tokens * 100)); // between 30s and 120s
    
    const response = await axios({
      method: 'post',
      url: `${QWEN_API_URL}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: qwenRequest,
      timeout: timeout
    });
    
    console.log('QWEN API response status:', response.status);
    
    // Transform chat completion response to text completion format
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      // Extract the assistant's response
      const assistantMessage = response.data.choices[0].message.content;
      
      // Format as a text completion response
      const textCompletionResponse = {
        id: response.data.id,
        object: 'text_completion',
        created: response.data.created,
        model: response.data.model,
        choices: [
          {
            text: assistantMessage,
            index: 0,
            logprobs: null,
            finish_reason: response.data.choices[0].finish_reason
          }
        ],
        usage: response.data.usage
      };
      
      return res.json(textCompletionResponse);
    }
    
    // If response format is unexpected, return it as is
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to QWEN API:', error.message);
    
    if (error.response) {
      console.error('QWEN API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: `QWEN API Error: ${error.response.data.error?.message || error.message}`,
          type: error.response.data.error?.type || 'api_error',
          param: null,
          code: error.response.status
        }
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: {
          message: 'Request to QWEN API timed out. Try with a shorter prompt or fewer tokens.',
          type: 'timeout_error',
          param: null,
          code: 504
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

// Embeddings endpoint
app.post('/api/qwen/embeddings', async (req, res) => {
  try {
    console.log('Received request to /api/qwen/embeddings');
    
    // Get input text(s) and model
    const { input, model } = req.body;
    
    if (!input) {
      return res.status(400).json({
        error: {
          message: 'Missing required parameter: input',
          type: 'invalid_request_error',
          param: 'input',
          code: 400
        }
      });
    }
    
    // Format request for QWEN embeddings
    const qwenRequest = {
      model: model || process.env.QWEN_EMBEDDING_MODEL || 'qwen2.5-embedding',
      input: input
    };
    
    console.log('Using embedding model:', qwenRequest.model);
    
    const response = await axios({
      method: 'post',
      url: `${QWEN_API_URL}/embeddings`,
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: qwenRequest,
      timeout: 60000 // 60 second timeout
    });
    
    console.log('QWEN Embeddings API response status:', response.status);
    
    // Return the response directly - should be compatible format
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to QWEN Embeddings API:', error.message);
    
    if (error.response) {
      console.error('QWEN API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: `QWEN API Error: ${error.response.data.error?.message || error.message}`,
          type: error.response.data.error?.type || 'api_error',
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

// Generic handler for other paths - redirect to chat/completions by default
app.post('/api/qwen/*', async (req, res) => {
  try {
    console.log(`Received request to ${req.path}, forwarding to completions endpoint`);
    
    // Extract the path after /api/qwen/
    const specificPath = req.path.substring('/api/qwen/'.length);
    
    // Default to chat/completions if path is empty or not recognized
    const apiPath = specificPath || 'chat/completions';
    
    const response = await axios({
      method: 'post',
      url: `${QWEN_API_URL}/${apiPath}`,
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: req.body,
      timeout: 120000 // 2 minute timeout
    });
    
    console.log('QWEN API response status:', response.status);
    
    // Return the response directly
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to QWEN API:', error.message);
    
    if (error.response) {
      console.error('QWEN API error response:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: `QWEN API Error: ${error.response.data.error?.message || error.message}`,
          type: error.response.data.error?.type || 'api_error',
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