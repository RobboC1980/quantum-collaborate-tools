# AI Integration for QuantumScribe

This document provides comprehensive instructions for setting up and using the AI integration in QuantumScribe.

## Overview

QuantumScribe uses the Qwen API from Alibaba Cloud to power its AI features. The integration is designed to be:

- **Robust**: Includes error handling, retries, and logging
- **Secure**: API keys are properly managed
- **Flexible**: Supports different Qwen models
- **Production-ready**: Optimized for reliability and performance

## Setup Instructions

### 1. API Key Configuration

You need a valid Qwen API key from Alibaba Cloud:

1. Create a `.env` file in the project root with your Qwen API key:
   ```
   VITE_QWEN_API_KEY=your-qwen-api-key-here
   ```

2. For production deployment, set the environment variable in your hosting environment.

### 2. Installation

```bash
# Install dependencies
npm install

# Start the application (includes both proxy server and frontend)
npm run start
```

### 3. Using the Start Script (Windows)

For Windows users, a convenient startup script is provided:

```bash
# Run the start script
.\start-app.bat
```

This script:
- Checks for and terminates any processes using required ports
- Creates a default `.env` file if one doesn't exist
- Installs dependencies if needed
- Starts both the proxy server and frontend application

## Architecture

The AI integration consists of three main components:

1. **Proxy Server** (`api-server.js`):
   - Runs on port 3001
   - Handles requests from the frontend
   - Transforms requests to match Qwen API format
   - Forwards requests to Qwen API
   - Transforms responses to match OpenAI format

2. **Client Integration** (`src/integrations/openai/client.ts`):
   - Provides a client-side interface to the AI functionality
   - Handles errors and connection issues
   - Supports both text generation and structured data generation

3. **AI Service** (`src/services/ai-service.ts`):
   - Provides domain-specific AI functionality
   - Implements retry logic and validation
   - Logs AI operations for monitoring

## Available AI Features

QuantumScribe includes several AI-powered features:

1. **Story Generation**:
   - Generates descriptions and outlines for writing projects
   - Accessible from the Story creation dialog

2. **Task Generation**:
   - Creates tasks based on story descriptions
   - Breaks down projects into actionable items

3. **Writing Assistance**:
   - Provides content drafts
   - Offers suggestions for improvement
   - Recommends research topics

## Troubleshooting

### Common Issues

1. **404 Not Found Error**:
   - Make sure the proxy server is running on port 3001
   - Check that the client is configured to use the correct endpoint

2. **Connection Refused Error**:
   - Ensure the proxy server is running
   - Check if another application is using port 3001
   - Try running the `start-app.bat` script to automatically handle port conflicts

3. **Invalid API Key**:
   - Verify your Qwen API key is correct in the `.env` file
   - Check the console logs for API key-related errors

### Debugging

1. Check the browser console for detailed error messages
2. Look at the proxy server logs for API request/response details
3. Use the health check endpoint to verify the proxy server is running:
   ```
   http://localhost:3002/api/health
   ```

## Production Deployment

For production deployment:

1. **Environment Variables**:
   - Set `VITE_QWEN_API_KEY` in your production environment
   - Never commit API keys to version control

2. **Proxy Server**:
   - Deploy the proxy server separately from the frontend
   - Consider using a process manager like PM2
   - Set up proper logging and monitoring

3. **Security Considerations**:
   - Use HTTPS for all communications
   - Implement rate limiting
   - Add authentication to the proxy server if needed

## Monitoring and Logging

The AI integration includes built-in logging:

- **Client-side**: Logs errors and connection issues to the console
- **Proxy Server**: Logs requests, responses, and errors
- **AI Service**: Logs operations with timestamps and status

For production, consider integrating with a proper logging service.

## Customization

### Changing AI Models

You can modify the available models in `src/integrations/ai-config.ts`:

```typescript
export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'qwen-max': {
    provider: 'qwen',
    model: 'qwen-max',
    description: 'Qwen 2.5 Max - Advanced model with strong capabilities',
    // ...
  },
  // Add or modify models here
};
```

### Adding New AI Features

To add new AI features:

1. Add new methods to the `aiService` in `src/services/ai-service.ts`
2. Use the `withRetry` helper for robust error handling
3. Validate responses to ensure they match expected formats

## License

This AI integration is part of QuantumScribe and is subject to the same license terms as the main project. 