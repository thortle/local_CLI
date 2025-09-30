import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createContentGeneratorConfig } from '../../gemini-cli-masters-core/dist/src/config/config.js';
import { LM_STUDIO_MODELS, getDefaultLMStudioModel } from '../../gemini-cli-masters-core/dist/src/config/models.js';

describe('Step 3: End-to-End Integration Workflow', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Full Workflow: /model lmstudio → provider switch → model usage', () => {
    it('should complete full workflow with default configuration', async () => {
      // Step 1: Set up environment
      process.env.LM_STUDIO_BASE_URL = 'http://127.0.0.1:1234';
      process.env.LM_STUDIO_MODEL = 'mistralai/devstral-small-2507';

      // Step 2: Create configuration (simulating CLI switch)
      const config = await createContentGeneratorConfig('lm-studio');
      
      expect(config).toBeDefined();
      expect(config.authType).toBe('lm-studio');
      expect(config.model).toBe('mistralai/devstral-small-2507');
      expect(config.baseUrl).toBe('http://127.0.0.1:1234');
    });

    it('should handle custom model selection', async () => {
      // Test with different model
      process.env.LM_STUDIO_MODEL = 'qwen/qwen3-coder-30b';

      const config = await createContentGeneratorConfig('lm-studio');
      
      expect(config.model).toBe('qwen/qwen3-coder-30b');
    });

    it('should validate model against available models list', () => {
      const testModel = 'mistralai/devstral-small-2507';
      const isValid = LM_STUDIO_MODELS.some(model => model.id === testModel);
      
      expect(isValid).toBe(true);
    });

    it('should get default model when none specified', () => {
      const defaultModel = getDefaultLMStudioModel();
      expect(defaultModel).toBe('mistralai/devstral-small-2507');
    });
  });

  describe('Provider Switching Integration', () => {
    it('should maintain configuration after provider switch', async () => {
      // Simulate switching from another provider to LM Studio
      const config = await createContentGeneratorConfig('lm-studio');
      
      expect(config.authType).toBe('lm-studio');
      expect(config.baseUrl).toContain('127.0.0.1:1234');
      expect(config.model).toBeTruthy();
    });

    it('should handle environment variable precedence', async () => {
      // Test custom URL
      process.env.LM_STUDIO_BASE_URL = 'http://localhost:8080';
      
      const config = await createContentGeneratorConfig('lm-studio');
      expect(config.baseUrl).toBe('http://localhost:8080');
    });
  });

  describe('MLX Model Categories', () => {
    it('should include coding models for development tasks', () => {
      const codingModels = LM_STUDIO_MODELS.filter(model => model.category === 'coding');
      expect(codingModels.length).toBeGreaterThan(0);
      
      const devstral = codingModels.find(model => model.id.includes('devstral'));
      expect(devstral).toBeDefined();
      expect(devstral.optimized).toBe('mlx');
    });

    it('should include general purpose models', () => {
      const generalModels = LM_STUDIO_MODELS.filter(model => model.category === 'general');
      expect(generalModels.length).toBeGreaterThan(0);
    });

    it('should include embedding models', () => {
      const embeddingModels = LM_STUDIO_MODELS.filter(model => model.category === 'embedding');
      expect(embeddingModels.length).toBeGreaterThan(0);
    });
  });
});
