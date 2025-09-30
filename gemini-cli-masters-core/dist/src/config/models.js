/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Gemini model constants
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-pro';
export const DEFAULT_GEMINI_FLASH_MODEL = 'gemini-2.5-flash';
export const DEFAULT_GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001';
// Anthropic model definitions - using actual Claude model names from API docs
export const ANTHROPIC_MODELS = [
    {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'Latest Claude 4 Sonnet model with enhanced capabilities',
        capabilities: ['Text', 'Code', 'Analysis', 'Vision', 'Advanced Reasoning'],
        isDefault: true,
    },
    {
        id: 'claude-opus-4-20250514',
        name: 'Claude Opus 4',
        description: 'Most capable Claude 4 model for complex tasks',
        capabilities: ['Text', 'Code', 'Analysis', 'Creative Writing', 'Complex Reasoning', 'Vision'],
    },
    {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude Sonnet 3.7',
        description: 'Advanced Claude 3.7 Sonnet model',
        capabilities: ['Text', 'Code', 'Analysis', 'Vision', 'Advanced Reasoning'],
    },
    {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude Sonnet 3.5',
        description: 'Proven Claude 3.5 Sonnet model',
        capabilities: ['Text', 'Code', 'Analysis', 'Vision', 'Advanced Reasoning'],
    },
    {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude Haiku 3.5',
        description: 'Fast and efficient Claude 3.5 model',
        capabilities: ['Text', 'Code', 'Analysis'],
    },
];
export const getDefaultAnthropicModel = () => {
    const defaultModel = ANTHROPIC_MODELS.find(model => model.isDefault);
    return defaultModel?.id || 'claude-sonnet-4-20250514';
};
export const getAnthropicModelInfo = (modelId) => ANTHROPIC_MODELS.find(model => model.id === modelId);
export const validateAnthropicModel = (modelId) => ANTHROPIC_MODELS.some(model => model.id === modelId);
//# sourceMappingURL=models.js.map