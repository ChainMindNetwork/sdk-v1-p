import { ChainMindSDK } from '../index';

describe('ChainMindSDK', () => {
  let sdk: ChainMindSDK;

  beforeEach(() => {
    sdk = new ChainMindSDK({
      agent: 'Stella'
    });
  });

  afterEach(() => {
    sdk.disconnect();
  });

  it('should initialize with correct config', () => {
    expect(sdk).toBeInstanceOf(ChainMindSDK);
  });

  it('should initialize with OpenRouter provider', () => {
    const openRouterSdk = new ChainMindSDK({
      agent: 'Stella',
      llmProvider: 'openrouter',
      openRouter: {
        apiKey: 'test_openrouter_key',
        model: 'openai/gpt-4'
      }
    });
    
    expect(openRouterSdk).toBeInstanceOf(ChainMindSDK);
  });

  it('should throw error when OpenRouter provider is specified without config', () => {
    expect(() => {
      new ChainMindSDK({
        agent: 'Stella',
        llmProvider: 'openrouter'
      });
    }).toThrow('OpenRouter configuration is required');
  });

  // Add more tests as needed
});
