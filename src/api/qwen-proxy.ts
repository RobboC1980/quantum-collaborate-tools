/**
 * Qwen API Proxy Service
 * 
 * This service provides a server-side proxy for calls to the Qwen API,
 * avoiding CORS issues when calling from the browser.
 */

// Proxy method for calling Qwen API
export const proxyQwenApi = async (
  endpoint: string,
  body: any,
  apiKey: string
): Promise<any> => {
  try {
    const response = await fetch(`https://dashscope.aliyuncs.com/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-SSE': 'enable', // Enable streaming if needed
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        `Qwen API responded with status ${response.status}: ${
          errorData.error || 'Unknown error'
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Qwen API Proxy Error:', error);
    throw error;
  }
};

export default proxyQwenApi; 