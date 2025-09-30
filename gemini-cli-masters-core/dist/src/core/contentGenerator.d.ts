/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CountTokensResponse, GenerateContentResponse, GenerateContentParameters, CountTokensParameters, EmbedContentResponse, EmbedContentParameters } from '@google/genai';
/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
    generateContent(request: GenerateContentParameters): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse>>;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
}
export declare enum AuthType {
    LOGIN_WITH_GOOGLE = "oauth-personal",
    USE_GEMINI = "gemini-api-key",
    USE_VERTEX_AI = "vertex-ai",
    USE_OPENAI_COMPATIBLE = "openai-compatible",
    USE_ANTHROPIC = "anthropic",
    USE_LOCAL_LLM = "local-llm",
    USE_AZURE = "azure"
}
export type ContentGeneratorConfig = {
    model: string;
    apiKey?: string;
    vertexai?: boolean;
    authType?: AuthType | undefined;
    baseUrl?: string;
    apiVersion?: string;
    customHeaders?: Record<string, string>;
    timeout?: number;
};
export declare function createContentGeneratorConfig(model: string | undefined, authType: AuthType | undefined, config?: {
    getModel?: () => string;
    getApiKeys?: () => Record<string, unknown>;
}): Promise<ContentGeneratorConfig>;
export declare function createContentGenerator(config: ContentGeneratorConfig, sessionId?: string): Promise<ContentGenerator>;
