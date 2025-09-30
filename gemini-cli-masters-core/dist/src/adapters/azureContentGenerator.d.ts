/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GenerateContentResponse, GenerateContentParameters } from '@google/genai';
import { ContentGeneratorConfig } from '../core/contentGenerator.js';
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
export declare class AzureContentGenerator extends OpenAICompatibleContentGenerator {
    protected azureConfig: ContentGeneratorConfig;
    constructor(azureConfig: ContentGeneratorConfig);
    /**
     * Streams content responses from Azure OpenAI API.
     */
    generateContentStream(request: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse>>;
    /**
     * Converts the `GenerateContentParameters` into Azure-specific request format.
     */
    protected convertToAzureFormat(request: GenerateContentParameters): {
        openAIRequest: any;
        endpoint: string;
    };
}
