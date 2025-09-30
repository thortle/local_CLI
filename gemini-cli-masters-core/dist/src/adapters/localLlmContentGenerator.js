/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { OpenAICompatibleContentGenerator } from './openaiCompatibleContentGenerator.js';
/**
 * Helper function to normalize ContentListUnion to Content array
 */
function normalizeContents(contents) {
    if (!contents)
        return [];
    // If it's already an array of Content objects
    if (Array.isArray(contents)) {
        return contents.filter((item) => item && typeof item === 'object' && 'parts' in item);
    }
    // If it's a single Content object
    if (typeof contents === 'object' && 'parts' in contents) {
        return [contents];
    }
    // If it's a string or PartUnion, convert to Content
    if (typeof contents === 'string') {
        return [{ parts: [{ text: contents }], role: 'user' }];
    }
    // If it's a Part object
    if (typeof contents === 'object' && ('text' in contents || 'inlineData' in contents)) {
        return [{ parts: [contents], role: 'user' }];
    }
    return [];
}
/**
 * Local LLM (Ollama) content generator that uses /api/chat endpoint
 * instead of the standard OpenAI /v1/chat/completions
 */
export class LocalLlmContentGenerator extends OpenAICompatibleContentGenerator {
    constructor(config) {
        super(config);
    }
    async generateContent(request) {
        const openAIRequest = this.convertToOpenAIFormat(request);
        const url = `${this.config.baseUrl}/v1/chat/completions`;
        // Enhanced debug logging for Local LLM requests
        const debugInfo = {
            timestamp: new Date().toISOString(),
            baseUrl: this.config.baseUrl,
            fullUrl: url,
            model: this.config.model,
            apiKey: this.config.apiKey ? '[PRESENT]' : '[NOT SET]',
            requestBody: openAIRequest
        };
        // Write debug info to file
        try {
            const fs = require('fs');
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Debug] ${JSON.stringify(debugInfo, null, 2)}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && this.config.apiKey !== 'dummy-key' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                ...this.config.customHeaders,
            },
            body: JSON.stringify(openAIRequest),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        // Log response status to file
        try {
            const fs = require('fs');
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Debug] Response status: ${response.status} ${response.statusText}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }
        if (!response.ok) {
            let errorBody = '';
            try {
                errorBody = await response.text();
                // Log error response to file
                try {
                    const fs = require('fs');
                    fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Debug] Error response body: ${errorBody}\n`);
                }
                catch (e) {
                    // Ignore file write errors
                }
            }
            catch (e) {
                // Log that we couldn't read error response
                try {
                    const fs = require('fs');
                    fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Debug] Could not read error response body\n`);
                }
                catch (e) {
                    // Ignore file write errors
                }
            }
            throw new Error(`Local LLM API Error: HTTP ${response.status}: ${response.statusText}${errorBody ? ' - ' + errorBody : ''}`);
        }
        const data = await response.json();
        console.log(`[Local LLM Debug] Success response:`, JSON.stringify(data, null, 2));
        const result = this.convertFromOpenAIFormat(data);
        if (!result) {
            throw new Error('Failed to convert Local LLM response');
        }
        return result;
    }
    async *generateContentStreamInternal(request) {
        const openAIRequest = { ...this.convertToOpenAIFormat(request), stream: true };
        const url = `${this.config.baseUrl}/v1/chat/completions`;
        // Enhanced debug logging for Local LLM streaming requests
        const debugInfo = {
            timestamp: new Date().toISOString(),
            baseUrl: this.config.baseUrl,
            fullUrl: url,
            model: this.config.model,
            apiKey: this.config.apiKey ? '[PRESENT]' : '[NOT SET]',
            requestBody: openAIRequest,
            isStreaming: true
        };
        // Write debug info to file
        try {
            const fs = require('fs');
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Streaming Debug] ${JSON.stringify(debugInfo, null, 2)}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }
        console.debug(`Local LLM (Ollama) making streaming request to: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && this.config.apiKey !== 'dummy-key' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                ...this.config.customHeaders,
            },
            body: JSON.stringify(openAIRequest),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        if (!response.ok) {
            let errorBody = '';
            try {
                errorBody = await response.text();
                // Log error response to file
                try {
                    const fs = require('fs');
                    fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Streaming Error] Status: ${response.status} ${response.statusText}\n`);
                    fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Local LLM Streaming Error] Response body: ${errorBody}\n`);
                }
                catch (e) {
                    // Ignore file write errors
                }
            }
            catch (e) {
                // Ignore body read errors
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorBody ? ' - ' + errorBody : ''}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        // Track accumulated tool call arguments for streaming
        const toolCallAccumulator = new Map();
        // Track mapping from index to actual call ID for streaming
        const indexToIdMap = new Map();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            // Process any accumulated tool calls at the end
                            if (toolCallAccumulator.size > 0) {
                                const completedToolCalls = Array.from(toolCallAccumulator.values());
                                const geminiResponse = this.convertAccumulatedToolCallsToGemini(completedToolCalls);
                                if (geminiResponse) {
                                    yield geminiResponse;
                                }
                            }
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const geminiResponse = this.convertFromOpenAIFormat(parsed, true, toolCallAccumulator, indexToIdMap);
                            if (geminiResponse) {
                                yield geminiResponse;
                            }
                        }
                        catch {
                            // Skip invalid JSON - this is expected for some streaming events
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async embedContent(request) {
        // Override to use Ollama's OpenAI-compatible /v1/embeddings endpoint
        const contents = normalizeContents(request.contents);
        const text = this.extractTextFromContents(contents);
        const response = await fetch(`${this.config.baseUrl}/v1/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && this.config.apiKey !== 'dummy-key' ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
                ...this.config.customHeaders,
            },
            body: JSON.stringify({
                input: text,
                model: request.model || this.config.model || 'nomic-embed-text',
            }),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            embeddings: [{
                    values: data.data?.[0]?.embedding || [],
                }],
        };
    }
    extractTextFromContents(contents) {
        return contents
            .map(content => content.parts
            ?.map((part) => ('text' in part ? part.text : ''))
            .join(' ') || '')
            .join(' ');
    }
}
//# sourceMappingURL=localLlmContentGenerator.js.map