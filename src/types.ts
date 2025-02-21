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