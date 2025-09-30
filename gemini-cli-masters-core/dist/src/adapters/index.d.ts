/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
import { AnthropicContentGenerator } from './anthropicContentGenerator.js';
import { LocalLlmContentGenerator } from './localLlmContentGenerator.js';
import { ContentGenerator, ContentGeneratorConfig, AuthType } from '../core/contentGenerator.js';
export declare function createCustomContentGenerator(authType: AuthType, config: ContentGeneratorConfig): ContentGenerator;
export declare function registerContentGenerator(authType: AuthType, generatorClass: new (config: ContentGeneratorConfig) => ContentGenerator): void;
export { OpenAICompatibleContentGenerator, AnthropicContentGenerator, LocalLlmContentGenerator };
