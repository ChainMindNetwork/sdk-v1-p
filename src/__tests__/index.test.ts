import { ChainMindSDK } from '../index';

describe('ChainMindSDK', () => {
  let sdk: ChainMindSDK;

  beforeEach(() => {
    sdk = new ChainMindSDK({
      apiKey: 'test_key',
      agent: 'Stella'
    });
  });

  afterEach(() => {
    sdk.disconnect();
  });

  it('should initialize with correct config', () => {
    expect(sdk).toBeInstanceOf(ChainMindSDK);
  });

  // Add more tests as needed
}); 