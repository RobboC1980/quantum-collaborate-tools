import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage } from 'http';

// Define extended types for proxy request handling
interface ProxyRequestWithBody extends IncomingMessage {
  _body?: string;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get API key from either server or client env var
  const apiKey = env.QWEN_API_KEY || env.VITE_QWEN_API_KEY || '';
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy API requests to avoid CORS issues
        '/api/qwen': {
          target: 'https://api.qwen.ai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/qwen/, ''),
          configure: (proxy, _options) => {
            // Add API key to all requests
            proxy.on('proxyReq', (proxyReq, req: ProxyRequestWithBody, _res) => {
              // Check if the request already has an API key
              const url = new URL(req.url || '', 'http://localhost');
              const hasApiKey = url.searchParams.has('api_key');
              
              // Access the body if it exists
              const body = req._body as string | undefined;
              
              if (apiKey && !hasApiKey) {
                // For GET requests, add API key as query parameter
                if (req.method === 'GET') {
                  proxyReq.path = `${proxyReq.path}${proxyReq.path.includes('?') ? '&' : '?'}api_key=${apiKey}`;
                } 
                // For POST requests with JSON body, add API key to the body
                else if (req.method === 'POST' && body) {
                  const contentType = proxyReq.getHeader('Content-Type');
                  if (contentType && contentType.toString().includes('application/json')) {
                    try {
                      const bodyData = JSON.parse(body);
                      if (!bodyData.api_key) {
                        bodyData.api_key = apiKey;
                        const newBody = JSON.stringify(bodyData);
                        proxyReq.setHeader('Content-Length', Buffer.byteLength(newBody));
                        proxyReq.write(newBody);
                      }
                    } catch (e) {
                      console.error('Error parsing request body:', e);
                    }
                  }
                }
              }
              
              if (mode === 'development') {
                console.log('Sending Request to the Target:', req.method, req.url);
              }
            });
            
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            
            if (mode === 'development') {
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              });
            }
          },
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
