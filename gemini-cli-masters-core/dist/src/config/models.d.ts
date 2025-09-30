/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const DEFAULT_GEMINI_MODEL = "gemini-2.5-pro";
export declare const DEFAULT_GEMINI_FLASH_MODEL = "gemini-2.5-flash";
export declare const DEFAULT_GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
export interface ModelInfo {
    id: string;
    name: string;
    description: string;
    capabilities?: string[];
    isDefault?: boolean;
}
export declare const ANTHROPIC_MODELS: ModelInfo[];
export declare const getDefaultAnthropicModel: () => string;
export declare const getAnthropicModelInfo: (modelId: string) => ModelInfo | undefined;
export declare const validateAnthropicModel: (modelId: string) => boolean;
