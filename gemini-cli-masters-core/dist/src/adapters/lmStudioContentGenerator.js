/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';

/**
 * Helper function to normalize ContentListUnion to Content array
 */
function normalizeContents(contents) {
    if (!contents)
        return [];
    // If it's already an array of Content objects
    if (Array.isArray(contents)) {
        return contents.filter((item) => item && typeof item === 'object' && 'parts' in item);
    }
    // If it's a single Content object
    if (typeof contents === 'object' && 'parts' in contents) {
        return [contents];
    }
    // If it's a string or PartUnion, convert to Content
    if (typeof contents === 'string') {
        return [{ parts: [{ text: contents }], role: 'user' }];
    }
    // If it's a Part object
    if (typeof contents === 'object' && ('text' in contents || 'inlineData' in contents)) {
        return [{ parts: [contents], role: 'user' }];
    }
    return [];
}

/**
 * LM Studio content generator optimized for MLX models on Apple Silicon
 * Uses OpenAI-compatible API endpoints at http://127.0.0.1:1234
 */
export class LMStudioContentGenerator extends OpenAICompatibleContentGenerator {
    constructor(config) {
        // Set LM Studio-specific defaults
        const lmStudioConfig = {
            ...config,
            baseUrl: config.baseUrl || 'http://127.0.0.1:1234',
            apiKey: config.apiKey || 'lm-studio', // LM Studio doesn't require real API key
            timeout: config.timeout || 30000, // 30s timeout for local inference
        };
        super(lmStudioConfig);
    }

    async generateContent(request) {
        const openAIRequest = this.convertToOpenAIFormat(request);
        const url = `${this.config.baseUrl}/v1/chat/completions`;

        // LM Studio optimizations for MLX
        if (openAIRequest.stream === undefined) {
            openAIRequest.stream = false; // Default to non-streaming for better compatibility
        }
        
        // Add MLX-specific parameters if not already set
        if (openAIRequest.temperature === undefined) {
            openAIRequest.temperature = 0.7; // Good default for MLX models
        }
        
        if (openAIRequest.top_p === undefined) {
            openAIRequest.top_p = 0.9; // Conservative top_p for better consistency
        }

        // Enhanced debug logging for LM Studio requests
        const debugInfo = {
            timestamp: new Date().toISOString(),
            provider: 'LM Studio',
            baseUrl: this.config.baseUrl,
            fullUrl: url,
            model: this.config.model,
            apiKey: this.config.apiKey ? '[PRESENT]' : '[NOT SET]',
            mlxOptimizations: {
                temperature: openAIRequest.temperature,
                top_p: openAIRequest.top_p,
                stream: openAIRequest.stream,
                max_tokens: openAIRequest.max_tokens
            },
            requestBody: openAIRequest
        };

        // Write debug info to file
        try {
            const fs = require('fs');
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[LM Studio Debug] ${JSON.stringify(debugInfo, null, 2)}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // LM Studio is flexible with API keys - some models don't need them
                ...(this.config.apiKey && this.config.apiKey !== 'lm-studio' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                ...this.config.customHeaders,
            },
            body: JSON.stringify(openAIRequest),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });

        // Log response status to file
        try {
            const fs = require('fs');
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[LM Studio Debug] Response status: ${response.status} ${response.statusText}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }

        if (!response.ok) {
            let errorBody = '';
            try {
                errorBody = await response.text();
                // Log error details
                try {
                    const fs = require('fs');
                    fs.appendFileSync('/tmp/gemini-cli-debug.log', `[LM Studio Debug] Error body: ${errorBody}\n`);
                }
                catch (e) {
                    // Ignore file write errors
                }
            }
            catch (e) {
                // Could not read error body
                errorBody = 'Unable to read error body';
            }

            // Provide LM Studio-specific error guidance
            if (response.status === 404) {
                throw new Error(`LM Studio model not found or not loaded. Please ensure:\n1. LM Studio is running\n2. A model is loaded\n3. The model supports the OpenAI API format\n\nOriginal error: HTTP ${response.status}: ${response.statusText}`);
            }
            else if (response.status === 503) {
                throw new Error(`LM Studio service unavailable. The model might be loading or the server is overloaded.\n\nOriginal error: HTTP ${response.status}: ${response.statusText}`);
            }
            else if (response.status === 400) {
                throw new Error(`LM Studio bad request. Check if the model supports function calling (tools) if you're using CLI tools.\n\nError details: ${errorBody}`);
            }
            else {
                throw new Error(`LM Studio error: HTTP ${response.status}: ${response.statusText}\nDetails: ${errorBody}`);
            }
        }

        const data = await response.json();

        // Log successful response details
        try {
            const fs = require('fs');
            const responseInfo = {
                timestamp: new Date().toISOString(),
                status: 'success',
                model: data.model,
                usage: data.usage,
                hasToolCalls: !!(data.choices?.[0]?.message?.tool_calls),
                responseLength: data.choices?.[0]?.message?.content?.length || 0
            };
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[LM Studio Debug] Response: ${JSON.stringify(responseInfo, null, 2)}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }

        const result = this.convertFromOpenAIFormat(data);
        if (!result) {
            throw new Error('Failed to convert LM Studio response to Gemini format');
        }
        return result;
    }

    async generateContentStream(request) {
        // Add MLX streaming optimizations
        const openAIRequest = this.convertToOpenAIFormat(request);
        
        // MLX models often perform better with smaller chunk sizes
        if (!openAIRequest.stream_options) {
            openAIRequest.stream_options = {
                include_usage: true
            };
        }

        return super.generateContentStreamInternal(request);
    }

    /**
     * Validate connection to LM Studio server
     */
    async validateConnection() {
        try {
            const response = await fetch(`${this.config.baseUrl}/v1/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && this.config.apiKey !== 'lm-studio' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                },
                signal: AbortSignal.timeout(5000), // 5 second timeout for health check
            });

            if (!response.ok) {
                throw new Error(`LM Studio not reachable: HTTP ${response.status}`);
            }

            const models = await response.json();
            const hasModels = models.data?.length > 0;
            
            if (!hasModels) {
                throw new Error('LM Studio is running but no models are loaded');
            }

            return {
                status: 'connected',
                modelsAvailable: models.data?.length || 0,
                loadedModels: models.data?.map(m => m.id) || []
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('LM Studio connection timeout - ensure LM Studio is running on port 1234');
            }
            throw new Error(`LM Studio connection failed: ${error.message}`);
        }
    }

    /**
     * Get available models from LM Studio
     */
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.config.baseUrl}/v1/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && this.config.apiKey !== 'lm-studio' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                },
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch models: HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.data?.map(model => ({
                id: model.id,
                name: model.id,
                loaded: true,
                object: model.object,
                created: model.created,
                owned_by: model.owned_by || 'local'
            })) || [];
        } catch (error) {
            console.warn('Could not fetch LM Studio models:', error.message);
            return [];
        }
    }

    /**
     * Convert request with MLX-specific optimizations
     */
    convertToOpenAIFormat(request) {
        const openAIRequest = super.convertToOpenAIFormat(request);
        
        // MLX-specific optimizations
        const mlxOptimizations = {
            // Recommended settings for Apple Silicon MLX models
            temperature: openAIRequest.temperature || 0.7,
            top_p: openAIRequest.top_p || 0.9,
            max_tokens: openAIRequest.max_tokens || 2048,
            stream: false,  // Non-streaming often faster on MLX
            
            // MLX models generally work better with these settings
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        };

        return {
            ...openAIRequest,
            ...mlxOptimizations
        };
    }
}

//# sourceMappingURL=lmStudioContentGenerator.js.map