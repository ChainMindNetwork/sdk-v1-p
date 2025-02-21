import WebSocket from 'ws';

interface ChainMindConfig {
  agent: 'Stella' | 'Matrix' | 'Lumina' | 'Nebula';
  apiUrl?: string;
}

interface WatchOptions {
  onData?: (data: any) => void;
  onError?: (error: any) => void;
}

export class ChainMindSDK {
  private agent: string;
  private apiUrl: string;
  private ws: WebSocket | null = null;

  constructor(config: ChainMindConfig) {
    this.agent = config.agent;
    this.apiUrl = config.apiUrl || 'https://api.chainmind.network';
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

  async askAgent(question: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/ask/${this.agent}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error('Failed to get agent response');
    }

    const data = await response.json();
    return data.response;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
} 