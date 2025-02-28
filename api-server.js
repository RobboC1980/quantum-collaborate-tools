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

// Attempt to load environment variables from .env file if it exists
let QWEN_API_KEY = process.env.VITE_QWEN_API_KEY;
try {
  if (fs.existsSync(path.join(process.cwd(), '.env'))) {
    const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    const qwenKeyMatch = envFile.match(/VITE_QWEN_API_KEY=(.+)/);
    if (qwenKeyMatch && qwenKeyMatch[1]) {
      QWEN_API_KEY = qwenKeyMatch[1];
    }
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

// Fallback to hardcoded value if no API key found
QWEN_API_KEY = QWEN_API_KEY || 'sk-cca2c0e57dd54ad19e4a8ef8c0ef23e2';

console.log('API proxy server is using API key:', QWEN_API_KEY.substring(0, 5) + '...');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy for Qwen API - Handles both paths for flexibility
app.post(['/api/qwen/v1/chat/completions', '/api/qwen/chat/completions'], async (req, res) => {
  try {
    console.log('Proxying request to Qwen API...');
    console.log('Request model:', req.body.model);
    
    const response = await axios({
      method: 'post',
      url: 'https://dashscope.aliyuncs.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: req.body
    });
    
    console.log('Qwen API response status:', response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Qwen API proxy error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error headers:', error.response.headers);
    }
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server with explicit error handling
const server = app.listen(PORT, () => {
  console.log(`API proxy server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use! Please close other applications using this port.`);
    console.error('This is critical: your frontend is configured to use this specific port.');
  } else {
    console.error('Failed to start server:', err);
  }
  process.exit(1);
}); 