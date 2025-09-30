/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CountTokensResponse, GenerateContentResponse, GenerateContentParameters, CountTokensParameters, EmbedContentResponse, EmbedContentParameters, Content } from '@google/genai';
import { ContentGenerator, ContentGeneratorConfig } from '../core/contentGenerator.js';
/**
 * Generic HTTP-based content generator for OpenAI-compatible APIs
 */
export declare class OpenAICompatibleContentGenerator implements ContentGenerator {
    protected config: ContentGeneratorConfig;
    constructor(config: ContentGeneratorConfig);
    generateContent(request: GenerateContentParameters): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse>>;
    protected generateContentStreamInternal(request: GenerateContentParameters): AsyncGenerator<GenerateContentResponse>;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
    protected convertToOpenAIFormat(request: GenerateContentParameters): any;
    protected convertFromOpenAIFormat(data: any, isStream?: boolean, toolCallAccumulator?: Map<string, {
        id: string;
        name: string;
        arguments: string;
    }>, indexToIdMap?: Map<number, string>): GenerateContentResponse | null;
    protected convertAccumulatedToolCallsToGemini(toolCalls: Array<{
        id: string;
        name: string;
        arguments: string;
    }>): GenerateContentResponse | null;
    protected extractTextFromContents(contents: Content[]): string;
    /**
     * Simplify complex JSON schemas for DeepSeek compatibility
     * DeepSeek has stricter schema validation than OpenAI/Gemini
     */
    private simplifySchemaForDeepSeek;
}
