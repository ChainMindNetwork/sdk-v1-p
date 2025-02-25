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

// Initialize SDK with your preferred agent
const chainmind = new ChainMindSDK({
  agent: "Stella", // or 'Matrix', 'Lumina', 'Nebula'
});

// Or initialize with OpenRouter as the LLM provider
const openRouterChainmind = new ChainMindSDK({
  agent: "Stella",
  llmProvider: "openrouter",
  openRouter: {
    apiKey: "your_openrouter_api_key",
    model: "openai/gpt-4" // Optional, defaults to 'openai/gpt-4'
  }
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

#### ChainMindConfig

```typescript
interface ChainMindConfig {
  agent: 'Stella' | 'Matrix' | 'Lumina' | 'Nebula';
  apiUrl?: string;
  llmProvider?: 'default' | 'openrouter';
  openRouter?: OpenRouterConfig;
}

interface OpenRouterConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}
```

### Methods

- `watchToken(tokenAddress: string, options?: WatchOptions): Promise<void>`
- `watchWallet(walletAddress: string, options?: WatchOptions): Promise<void>`
- `getLiquidityAnalysis(options?: WatchOptions): Promise<void>`
- `askAgent(question: string, options?: AskOptions): Promise<string>`
- `disconnect(): void`

#### AskOptions

```typescript
interface AskOptions {
  stream?: boolean;
  onToken?: (token: string) => void;
  onError?: (error: any) => void;
}
```

## OpenRouter Integration

ChainMind SDK now supports OpenRouter as an LLM provider, giving you access to hundreds of AI models through a single endpoint.

### Configuring OpenRouter

```typescript
const sdk = new ChainMindSDK({
  agent: "Stella",
  llmProvider: "openrouter",
  openRouter: {
    apiKey: "your_openrouter_api_key",
    model: "openai/gpt-4", // Optional, defaults to 'openai/gpt-4'
    baseUrl: "https://openrouter.ai/api/v1" // Optional
  }
});
```

### Available Models

OpenRouter provides access to models from various providers including:

- OpenAI (e.g., 'openai/gpt-4', 'openai/gpt-3.5-turbo')
- Anthropic (e.g., 'anthropic/claude-3-opus', 'anthropic/claude-3-sonnet')
- Cohere, Mistral, and many more

For a complete list of available models, refer to the [OpenRouter documentation](https://openrouter.ai/docs).

### Streaming Responses

You can enable streaming responses when using the `askAgent` method:

```typescript
let fullResponse = '';

await sdk.askAgent("What's happening with SOL right now?", {
  stream: true,
  onToken: (token) => {
    fullResponse += token;
    console.log(token); // Process each token as it arrives
  },
  onError: (error) => {
    console.error("Error:", error);
  }
});

console.log("Complete response:", fullResponse);
```

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
