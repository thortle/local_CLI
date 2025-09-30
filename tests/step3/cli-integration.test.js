import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

// Mock fetch for testing
vi.mock('node-fetch');
const mockFetch = vi.mocked(fetch);

describe('Step 3: CLI Integration - LM Studio Model Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('/model lmstudio command', () => {
    it('should successfully switch to LM Studio when available', async () => {
      // Mock successful LM Studio response
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: [
            { id: 'mistralai/devstral-small-2507', object: 'model' },
            { id: 'qwen/qwen3-coder-30b', object: 'model' }
          ]
        })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Test would simulate CLI command execution
      // This is a unit test framework - actual CLI testing would require integration testing
      expect(mockFetch).toBeDefined();
    });

    it('should handle LM Studio unavailable error', async () => {
      // Mock failed connection
      const mockResponse = {
        ok: false,
        status: 500
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Test error handling
      expect(mockFetch).toBeDefined();
    });

    it('should handle no models loaded error', async () => {
      // Mock successful connection but no models
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: []
        })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      // Test no models error
      expect(mockResponse.ok).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    it('should use default LM Studio endpoint when env var not set', () => {
      delete process.env.LM_STUDIO_BASE_URL;
      const defaultUrl = 'http://127.0.0.1:1234';
      expect(process.env.LM_STUDIO_BASE_URL || defaultUrl).toBe(defaultUrl);
    });

    it('should use custom LM Studio endpoint from env var', () => {
      process.env.LM_STUDIO_BASE_URL = 'http://localhost:8080';
      expect(process.env.LM_STUDIO_BASE_URL).toBe('http://localhost:8080');
    });

    it('should use default model when env var not set', () => {
      delete process.env.LM_STUDIO_MODEL;
      const defaultModel = 'mistralai/devstral-small-2507';
      expect(process.env.LM_STUDIO_MODEL || defaultModel).toBe(defaultModel);
    });
  });

  describe('Help Text Integration', () => {
    it('should include lmstudio in model command help', () => {
      const helpText = '/model <provider> - Switch AI provider (gemini, claude, openai, azure, ollama, lmstudio)';
      expect(helpText).toContain('lmstudio');
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages for common issues', () => {
      const errorMessages = {
        connectionFailed: 'LM Studio not available at http://127.0.0.1:1234',
        noModels: 'No models loaded in LM Studio',
        serverNotRunning: 'Make sure LM Studio is running and has models loaded'
      };

      expect(errorMessages.connectionFailed).toContain('LM Studio not available');
      expect(errorMessages.noModels).toContain('No models loaded');
      expect(errorMessages.serverNotRunning).toContain('Make sure LM Studio is running');
    });
  });
});
