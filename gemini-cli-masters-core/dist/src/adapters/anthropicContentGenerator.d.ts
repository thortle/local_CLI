/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CountTokensResponse, GenerateContentResponse, GenerateContentParameters, CountTokensParameters, EmbedContentResponse, EmbedContentParameters } from '@google/genai';
import { ContentGenerator, ContentGeneratorConfig } from '../core/contentGenerator.js';
/**
 * Anthropic Claude API content generator
 */
export declare class AnthropicContentGenerator implements ContentGenerator {
    private config;
    constructor(config: ContentGeneratorConfig);
    generateContent(request: GenerateContentParameters): Promise<GenerateContentResponse>;
    generateContentStream(request: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse>>;
    private generateContentStreamInternal;
    countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;
    embedContent(_request: EmbedContentParameters): Promise<EmbedContentResponse>;
    private convertToAnthropicFormat;
    private convertToolResultsToTextForAnthropic;
    private convertContentsToAnthropicMessages;
    private convertFromAnthropicFormat;
    private handleAnthropicStreamingEvent;
    private createStreamingTextResponse;
    private convertAccumulatedAnthropicToolCallsToGemini;
    private extractTextFromContents;
}
