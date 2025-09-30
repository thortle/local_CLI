/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { AuthType } from './contentGenerator.js';
export declare function getCoreSystemPrompt(userMemory?: string, authType?: AuthType, model?: string): string;
/**
 * Provides the system prompt for the history compression process.
 * This prompt instructs the model to act as a specialized state manager,
 * think in a scratchpad, and produce a structured XML summary.
 */
export declare function getCompressionPrompt(): string;
