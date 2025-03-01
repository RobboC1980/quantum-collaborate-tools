# Qwen API Integration Guide

This document provides instructions for setting up and troubleshooting the Qwen API integration with QuantumScribe.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- A valid Qwen API key from Alibaba Cloud

## Initial Setup

1. Create a `.env` file in the project root with your Qwen API key:
   ```
   VITE_QWEN_API_KEY=your-qwen-api-key-here
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Option 1: Recommended - Using the start-app script (Windows)

The easiest way to start the application is to use the provided batch file:

```
start-app.bat
```

This script:
- Automatically detects and terminates any processes using port 3001 (required for the proxy server)
- Starts both the proxy server and the Vite development server

### Option 2: Manual Start (Windows/macOS/Linux)

If you prefer to start the services manually:

1. **Start the proxy server** in one terminal:
   ```
   npm run proxy
   ```

2. **Start the frontend** in another terminal:
   ```
   npm run dev
   ```

Or use the combined start command (requires both ports to be free):
```
npm run start
```

## Troubleshooting Connection Issues

If you encounter connection errors when using Qwen API features:

### Common Error: Connection Refused

If you see an error like `ERR_CONNECTION_REFUSED` when using AI features:

1. Make sure the proxy server is running on port 3001
2. Check if another application is using port 3001:
   - Windows: `netstat -ano | findstr :3001`
   - macOS/Linux: `lsof -i :3001`
3. If port 3001 is in use, terminate the process or use the `start-app.bat` script to do it automatically

### Debugging Steps

1. Verify the proxy server is running by visiting:
   ```
   http://localhost:3002/api/health
   ```
   You should see `{"status":"ok"}`

2. Check console logs in both the proxy server terminal and browser developer tools for specific error messages

3. Ensure your Qwen API key is correctly set in the `.env` file

## Architecture

The integration works by:

1. The frontend makes requests to a local proxy server (http://localhost:3002)
2. The proxy server forwards requests to the Qwen API (https://dashscope.aliyuncs.com)
3. This approach avoids CORS issues that would occur with direct browser-to-Qwen API calls

## Key Files

- `api-server.js` - The proxy server implementation
- `src/integrations/openai/client.ts` - Client-side API integration
- `src/services/ai-service.ts` - Service layer for AI features 