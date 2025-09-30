/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
import type { ContentGeneratorConfig } from '../core/contentGenerator.js';

/**
 * LM Studio content generator optimized for MLX models on Apple Silicon
 * Uses OpenAI-compatible API endpoints at http://127.0.0.1:1234
 */
export declare class LMStudioContentGenerator extends OpenAICompatibleContentGenerator {
    constructor(config: ContentGeneratorConfig);
    
    /**
     * Validate connection to LM Studio server
     */
    validateConnection(): Promise<{
        status: string;
        modelsAvailable: number;
        loadedModels: string[];
    }>;
    
    /**
     * Get available models from LM Studio
     */
    getAvailableModels(): Promise<Array<{
        id: string;
        name: string;
        loaded: boolean;
        object?: string;
        created?: number;
        owned_by?: string;
    }>>;
}