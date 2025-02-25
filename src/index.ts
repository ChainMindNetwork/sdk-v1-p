import WebSocket from 'ws';
import { 
  OpenRouterConfig, 
  ChainMindConfig, 
  WatchOptions, 
  AskOptions 
} from './types';

export class ChainMindSDK {
  private agent: string;
  private apiUrl: string;
  private ws: WebSocket | null = null;
  private llmProvider: 'default' | 'openrouter';
  private openRouterConfig?: OpenRouterConfig;

  constructor(config: ChainMindConfig) {
    this.agent = config.agent;
    this.apiUrl = config.apiUrl || 'https://api.chainmind.network';
    this.llmProvider = config.llmProvider || 'default';
    this.openRouterConfig = config.openRouter;
    
    if (this.llmProvider === 'openrouter' && !this.openRouterConfig) {
      throw new Error('OpenRouter configuration is required when using OpenRouter as LLM provider');
    }
  }

  private async connectWebSocket(endpoint: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${this.apiUrl.replace('http', 'ws')}/${endpoint}`);
      
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  }

  async watchToken(tokenAddress: string, options?: WatchOptions): Promise<void> {
    const ws = await this.connectWebSocket(`token-trades-stream/${this.agent}?tokens=${tokenAddress}`);
    
    ws.on('message', (data) => {
      const rawData = data.toString();
      console.log('Raw token data:', rawData);
      const parsedData = JSON.parse(data.toString());
      console.log('Parsed token data:', JSON.stringify(parsedData, null, 2));
      options?.onData?.(parsedData);
    });

    ws.on('error', (error) => {
      options?.onError?.(error);
    });

    this.ws = ws;
  }

  async watchWallet(walletAddress: string, options?: WatchOptions): Promise<void> {
    const ws = await this.connectWebSocket(`account-trades-stream/${this.agent}?accounts=${walletAddress}`);
    
    ws.on('message', (data) => {
      const rawData = data.toString();
      console.log('Raw wallet data:', rawData);
      const parsedData = JSON.parse(data.toString());
      console.log('Parsed wallet data:', JSON.stringify(parsedData, null, 2));
      options?.onData?.(parsedData);
    });

    ws.on('error', (error) => {
      options?.onError?.(error);
    });

    this.ws = ws;
  }

  async getLiquidityAnalysis(options?: WatchOptions): Promise<void> {
    const ws = await this.connectWebSocket(`raydium-liquidity-stream/${this.agent}`);
    
    ws.on('message', (data) => {
      const rawData = data.toString();
      console.log('Raw liquidity data:', rawData);
      const parsedData = JSON.parse(data.toString());
      console.log('Parsed liquidity data:', JSON.stringify(parsedData, null, 2));
      options?.onData?.(parsedData);
    });

    ws.on('error', (error) => {
      options?.onError?.(error);
    });

    this.ws = ws;
  }

  async askAgent(question: string, options?: AskOptions): Promise<string> {
    if (this.llmProvider === 'openrouter') {
      return this.askOpenRouter(question, options);
    } else {
      // Default ChainMind API
      // Note: The default API might not support streaming
      const response = await fetch(`${this.apiUrl}/ask/${this.agent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          stream: options?.stream || false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Failed to get agent response: ${errorText}`);
        if (options?.onError) {
          options.onError(error);
          return '';
        } else {
          throw error;
        }
      }

      // Handle streaming if supported by the default API
      if (options?.stream && response.headers.get('content-type')?.includes('text/event-stream')) {
        let fullResponse = '';
        const reader = response.body?.getReader();
        
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Process the chunk (this depends on the server's SSE format)
          // This is a simplified example
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const token = parsed.choices?.[0]?.delta?.content || '';
                  if (token) {
                    options?.onToken?.(token);
                    fullResponse += token;
                  }
                } catch (e) {
                  // Ignore parsing errors for non-JSON data
                }
              }
            }
          }
        }
        
        return fullResponse;
      } else {
        // Non-streaming response
        const data = await response.json();
        return data.response;
      }
    }
  }

  private async askOpenRouter(question: string, options?: AskOptions): Promise<string> {
    if (!this.openRouterConfig) {
      throw new Error('OpenRouter configuration is required');
    }

    const baseUrl = this.openRouterConfig.baseUrl || 'https://openrouter.ai/api/v1';
    const model = this.openRouterConfig.model || 'openai/gpt-4';
    const isStreaming = options?.stream || false;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
        'HTTP-Referer': 'https://chainmind.network', // Optional for rankings
        'X-Title': `ChainMind ${this.agent}`, // Optional for rankings
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are ${this.agent}, an AI agent specialized in Solana blockchain analysis.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        stream: isStreaming
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`OpenRouter API error: ${errorText}`);
      if (options?.onError) {
        options.onError(error);
        return '';
      } else {
        throw error;
      }
    }

    // Handle streaming response
    if (isStreaming) {
      let fullResponse = '';
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Process the chunk according to SSE format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              // Skip OpenRouter processing comments
              if (data.startsWith(':')) continue;
              
              if (data === '[DONE]') {
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content || '';
                if (token) {
                  options?.onToken?.(token);
                  fullResponse += token;
                }
              } catch (e) {
                // Ignore parsing errors for non-JSON data
              }
            }
          }
        }
      } catch (error) {
        if (options?.onError) {
          options.onError(error);
        } else {
          throw error;
        }
      }
      
      return fullResponse;
    } else {
      // Non-streaming response
      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response from OpenRouter';
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
