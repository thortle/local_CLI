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

// LM Studio model definitions for MLX-optimized models
export const LM_STUDIO_MODELS = [
    {
        id: 'mistralai/devstral-small-2507',
        name: 'Devstral Small (MLX)',
        description: 'Mistral AI Devstral small model optimized for coding tasks on MLX',
        capabilities: ['Code', 'Programming', 'Analysis', 'Debugging'],
        isDefault: true,
        optimized: 'mlx',
        category: 'coding'
    },
    {
        id: 'qwen/qwen3-coder-30b',
        name: 'Qwen3 Coder 30B (MLX)',
        description: 'Large Qwen3 coder model with 30B parameters for complex coding tasks',
        capabilities: ['Code', 'Programming', 'Complex Analysis', 'Architecture Design'],
        optimized: 'mlx',
        category: 'coding'
    },
    {
        id: 'text-embedding-nomic-embed-text-v1.5',
        name: 'Nomic Embed Text v1.5',
        description: 'High-quality text embedding model for semantic search and similarity',
        capabilities: ['Embeddings', 'Semantic Search', 'Text Analysis'],
        optimized: 'mlx',
        category: 'embedding'
    },
    {
        id: 'mlx-community/Llama-3.2-3B-Instruct-4bit',
        name: 'Llama 3.2 3B Instruct (MLX)',
        description: 'Fast and efficient Llama 3.2 3B model optimized for MLX',
        capabilities: ['Text', 'Code', 'Instruct', 'General Purpose'],
        optimized: 'mlx',
        category: 'general'
    },
    {
        id: 'mlx-community/Llama-3.1-8B-Instruct-4bit',
        name: 'Llama 3.1 8B Instruct (MLX)',
        description: 'Balanced Llama 3.1 8B model with MLX optimization',
        capabilities: ['Text', 'Code', 'Analysis', 'Instruct'],
        optimized: 'mlx',
        category: 'general'
    },
    {
        id: 'mlx-community/Qwen2.5-7B-Instruct-4bit',
        name: 'Qwen2.5 7B Instruct (MLX)',
        description: 'High-performance Qwen2.5 7B model for Apple Silicon',
        capabilities: ['Text', 'Code', 'Multilingual', 'Instruct'],
        optimized: 'mlx',
        category: 'general'
    },
    {
        id: 'mlx-community/DeepSeek-Coder-V2-Lite-Instruct-4bit',
        name: 'DeepSeek Coder V2 Lite (MLX)',
        description: 'Specialized coding model optimized for MLX',
        capabilities: ['Code', 'Programming', 'Analysis'],
        optimized: 'mlx',
        category: 'coding'
    }
];

export const getDefaultLMStudioModel = () => {
    const defaultModel = LM_STUDIO_MODELS.find(model => model.isDefault);
    return defaultModel?.id || 'mistralai/devstral-small-2507';
};

export const getLMStudioModelInfo = (modelId) => 
    LM_STUDIO_MODELS.find(model => model.id === modelId);

export const validateLMStudioModel = (modelId) => 
    LM_STUDIO_MODELS.some(model => model.id === modelId);

export const getLMStudioModelsByCategory = (category) => 
    LM_STUDIO_MODELS.filter(model => model.category === category);

//# sourceMappingURL=models.js.map