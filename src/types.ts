export interface TradeData {
  symbol: string;
  side: 'buy' | 'sell';
  tokenAmount: string;
  price: string;
  timestamp: string;
  agentComment: string;
}

export interface LiquidityData {
  pool: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  timestamp: string;
  agentComment: string;
}

export interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface ChainMindConfig {
  agent: 'Stella' | 'Matrix' | 'Lumina' | 'Nebula';
  apiUrl?: string;
  llmProvider?: 'default' | 'openrouter';
  openRouter?: OpenRouterConfig;
}

export interface WatchOptions {
  onData?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface AskOptions {
  stream?: boolean;
  onToken?: (token: string) => void;
  onError?: (error: any) => void;
}
