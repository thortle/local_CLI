/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
import { ContentGeneratorConfig } from '../core/contentGenerator.js';
import { GenerateContentParameters, Content, EmbedContentParameters, EmbedContentResponse } from '@google/genai';
/**
 * Local LLM (Ollama) content generator that uses /api/chat endpoint
 * instead of the standard OpenAI /v1/chat/completions
 */
export declare class LocalLlmContentGenerator extends OpenAICompatibleContentGenerator {
    constructor(config: ContentGeneratorConfig);
    generateContent(request: GenerateContentParameters): Promise<import("@google/genai").GenerateContentResponse>;
    protected generateContentStreamInternal(request: GenerateContentParameters): AsyncGenerator<import("@google/genai").GenerateContentResponse, void, unknown>;
    embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;
    protected extractTextFromContents(contents: Content[]): string;
}
