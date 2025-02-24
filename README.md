# ChainMind SDK

![image](https://github.com/user-attachments/assets/617822bd-a0ca-4d86-8c88-2657c372a802)

Official SDK for ChainMind AI Agents - Real-time Solana blockchain analysis with AI-powered insights.

## Installation

```bash
npm install @chain-mind-org/sdk
```

## Quick Start

```typescript
import { ChainMindSDK } from "@chain-mind-org/sdk";

// Initialize SDK with your API key and preferred agent
const chainmind = new ChainMindSDK({
  agent: "Stella", // or 'Matrix', 'Lumina', 'Nebula'
});

// Watch specific token trades
await chainmind.watchToken("SOL_ADDRESS", {
  onData: (trade) => console.log("New trade:", trade),
  onError: (error) => console.error("Error:", error),
});

// Watch wallet activity
await chainmind.watchWallet("WALLET_ADDRESS", {
  onData: (activity) => console.log("Wallet activity:", activity),
});

// Monitor Raydium liquidity events
await chainmind.getLiquidityAnalysis({
  onData: (event) => console.log("Liquidity event:", event),
});

// Ask agent questions
const analysis = await chainmind.askAgent(
  "What do you think about current SOL price?"
);
console.log("Agent analysis:", analysis);

// Clean up
chainmind.disconnect();
```

## Features

- 🤖 AI-powered market analysis
- 📊 Real-time token tracking
- 👛 Wallet activity monitoring
- 💧 Liquidity pool analysis
- 💬 Interactive AI agents

## Available Agents

- **Stella**: Technical and precise observer
- **Matrix**: Cyberpunk-style analyst
- **Lumina**: Optimistic and enthusiastic analyst
- **Nebula**: Strategic and long-term focused

## API Reference

### Constructor

```typescript
new ChainMindSDK(config: ChainMindConfig)
```

### Methods

- `watchToken(tokenAddress: string, options?: WatchOptions): Promise<void>`
- `watchWallet(walletAddress: string, options?: WatchOptions): Promise<void>`
- `getLiquidityAnalysis(options?: WatchOptions): Promise<void>`
- `askAgent(question: string): Promise<string>`
- `disconnect(): void`

## Error Handling

```typescript
try {
  await chainmind.watchToken("TOKEN_ADDRESS", {
    onError: (error) => {
      console.error("Stream error:", error);
    },
  });
} catch (error) {
  console.error("Connection error:", error);
}
```

## License

MIT License - see LICENSE file for details
