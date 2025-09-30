/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
import { AnthropicContentGenerator } from './anthropicContentGenerator.js';
import { AzureContentGenerator } from './azureContentGenerator.js';
import { LocalLlmContentGenerator } from './localLlmContentGenerator.js';
import { LMStudioContentGenerator } from './lmStudioContentGenerator.js';
export function createCustomContentGenerator(authType, config) {
    // Debug log to file
    try {
        const fs = require('fs');
        const debugInfo = {
            timestamp: new Date().toISOString(),
            authType,
            config: { ...config, apiKey: config.apiKey ? '[PRESENT]' : '[NOT SET]' }
        };
        fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Adapter Selection] ${JSON.stringify(debugInfo, null, 2)}\n`);
    }
    catch (e) {
        // Ignore file write errors
    }
    // Use string literals to avoid circular dependency with enum values
    switch (authType) {
        case 'openai-compatible':
            return new OpenAICompatibleContentGenerator(config);
        case 'local-llm':
            return new LocalLlmContentGenerator(config);
        case 'lm-studio':
            return new LMStudioContentGenerator(config);
        case 'anthropic':
            return new AnthropicContentGenerator(config);
        case 'azure':
            return new AzureContentGenerator(config);
        default:
            // Check global registry for custom providers
            const GeneratorClass = globalContentGeneratorRegistry.get(authType);
            if (GeneratorClass) {
                return new GeneratorClass(config);
            }
            throw new Error(`No content generator available for auth type: ${authType}`);
    }
}
// Global registry for external registrations
const globalContentGeneratorRegistry = new Map();
export function registerContentGenerator(authType, generatorClass) {
    globalContentGeneratorRegistry.set(authType, generatorClass);
}
// Export all generators for direct use if needed
export { OpenAICompatibleContentGenerator, AnthropicContentGenerator, LocalLlmContentGenerator, LMStudioContentGenerator };
//# sourceMappingURL=index.js.map