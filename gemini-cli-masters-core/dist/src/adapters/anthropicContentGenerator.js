/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
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
 * Anthropic Claude API content generator
 */
export class AnthropicContentGenerator {
    config;
    constructor(config) {
        this.config = config;
    }
    async generateContent(request) {
        const anthropicRequest = this.convertToAnthropicFormat(request);
        const requestUrl = `${this.config.baseUrl}/v1/messages`;
        // Write debug info to file
        try {
            const fs = require('fs');
            const debugInfo = {
                timestamp: new Date().toISOString(),
                baseUrl: this.config.baseUrl,
                fullUrl: requestUrl,
                apiKey: this.config.apiKey ? '[PRESENT]' : '[NOT SET]'
            };
            fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Anthropic Debug] ${JSON.stringify(debugInfo, null, 2)}\n`);
        }
        catch (e) {
            // Ignore file write errors
        }
        let response;
        try {
            response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.config.apiKey,
                    'anthropic-version': '2023-06-01',
                    ...this.config.customHeaders,
                },
                body: JSON.stringify(anthropicRequest),
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
            });
        }
        catch (error) {
            // Handle network errors (fetch failed, timeout, etc.)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Anthropic API. Please check your internet connection and API endpoint.');
            }
            else if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout: The request to Anthropic API timed out. Please try again.');
            }
            else {
                throw new Error(`Unexpected error: ${String(error)}`);
            }
        }
        if (!response.ok) {
            let errorDetails = '';
            let errorMessage = '';
            try {
                const errorData = await response.json();
                errorDetails = JSON.stringify(errorData);
                // Provide specific error messages for common issues
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your Anthropic API key.';
                }
                else if (response.status === 403) {
                    errorMessage = 'Access denied. Your API key may not have the required permissions.';
                }
                else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again later.';
                }
                else if (response.status === 400) {
                    errorMessage = 'Bad request. Please check your input parameters.';
                }
                else if (response.status >= 500) {
                    errorMessage = 'Anthropic API server error. Please try again later.';
                }
                else {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            catch (_e) {
                // Don't try to read response again - just use basic error message
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            const fullError = `${errorMessage}${errorDetails ? ` Details: ${errorDetails}` : ''}`;
            throw new Error(fullError);
        }
        const data = await response.json();
        const result = this.convertFromAnthropicFormat(data);
        if (!result) {
            throw new Error('Failed to convert Anthropic response');
        }
        return result;
    }
    async generateContentStream(request) {
        return this.generateContentStreamInternal(request);
    }
    async *generateContentStreamInternal(request) {
        const anthropicRequest = {
            ...this.convertToAnthropicFormat(request),
            stream: true
        };
        let response;
        try {
            response = await fetch(`${this.config.baseUrl}/v1/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.config.apiKey,
                    'anthropic-version': '2023-06-01',
                    ...this.config.customHeaders,
                },
                body: JSON.stringify(anthropicRequest),
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
            });
        }
        catch (error) {
            // Handle network errors (fetch failed, timeout, etc.)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Anthropic API. Please check your internet connection and API endpoint.');
            }
            else if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout: The request to Anthropic API timed out. Please try again.');
            }
            else {
                throw new Error(`Unexpected error: ${String(error)}`);
            }
        }
        if (!response.ok) {
            let errorDetails = '';
            let errorMessage = '';
            try {
                const errorData = await response.json();
                errorDetails = JSON.stringify(errorData);
                // Provide specific error messages for common issues
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your Anthropic API key.';
                }
                else if (response.status === 403) {
                    errorMessage = 'Access denied. Your API key may not have the required permissions.';
                }
                else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again later.';
                }
                else if (response.status === 400) {
                    errorMessage = 'Bad request. Please check your input parameters.';
                }
                else if (response.status >= 500) {
                    errorMessage = 'Anthropic API server error. Please try again later.';
                }
                else {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            }
            catch (_e) {
                // Don't try to read response again - just use basic error message
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            const fullError = `${errorMessage}${errorDetails ? ` Details: ${errorDetails}` : ''}`;
            throw new Error(fullError);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }
        const decoder = new TextDecoder();
        let buffer = '';
        // Track accumulated tool call inputs for streaming
        const toolCallAccumulator = new Map();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('event: ')) {
                        continue;
                    }
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        try {
                            const parsed = JSON.parse(data);
                            const geminiResponse = this.convertFromAnthropicFormat(parsed, true, toolCallAccumulator);
                            if (geminiResponse) {
                                yield geminiResponse;
                            }
                        }
                        catch (e) {
                            // Skip invalid JSON - this is expected for some Anthropic streaming events
                            // Don't log this as it's normal behavior
                        }
                    }
                }
            }
            // Process any accumulated tool calls at the end
            if (toolCallAccumulator.size > 0) {
                const completedToolCalls = Array.from(toolCallAccumulator.values());
                const geminiResponse = this.convertAccumulatedAnthropicToolCallsToGemini(completedToolCalls);
                if (geminiResponse) {
                    yield geminiResponse;
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async countTokens(request) {
        // Anthropic doesn't provide token counting API, so approximate
        const contents = normalizeContents(request.contents);
        const text = this.extractTextFromContents(contents);
        const approximateTokens = Math.ceil(text.length / 4);
        return {
            totalTokens: approximateTokens,
        };
    }
    async embedContent(_request) {
        throw new Error('Anthropic does not support embeddings');
    }
    convertToAnthropicFormat(request) {
        const contents = normalizeContents(request.contents);
        // For Anthropic, convert tool results to text summaries to avoid conversation structure issues
        // This happens because the CLI doesn't maintain proper conversation continuity for tool calling
        const processedContents = this.convertToolResultsToTextForAnthropic(contents);
        return this.convertContentsToAnthropicMessages(processedContents, request);
    }
    convertToolResultsToTextForAnthropic(contents) {
        return contents.map(content => {
            if (content.role === 'user' && content.parts?.some((part) => 'functionResponse' in part)) {
                // This message contains tool results - convert them to readable text
                const textParts = [];
                const toolResults = [];
                // Separate text parts from tool results
                for (const part of content.parts) {
                    if ('functionResponse' in part && part.functionResponse) {
                        toolResults.push(part);
                    }
                    else if ('text' in part && part.text) {
                        textParts.push(part);
                    }
                }
                // If there are tool results, convert them to text
                if (toolResults.length > 0) {
                    let summaryText = '';
                    // Add any existing text first
                    if (textParts.length > 0) {
                        summaryText = textParts.map(p => p.text).join('\n') + '\n\n';
                    }
                    summaryText += '## Tool Execution Completed\n\n';
                    summaryText += 'The following tools have been executed successfully:\n\n';
                    for (const part of toolResults) {
                        if ('functionResponse' in part && part.functionResponse) {
                            const response = typeof part.functionResponse.response === 'string'
                                ? part.functionResponse.response
                                : JSON.stringify(part.functionResponse.response, null, 2);
                            summaryText += `### ${part.functionResponse.name}\n`;
                            summaryText += '```\n';
                            summaryText += response;
                            summaryText += '\n```\n\n';
                        }
                    }
                    summaryText += '**Task completed successfully.** Please provide a summary of these results and any insights.';
                    // Return the message with converted text
                    return {
                        ...content,
                        parts: [{ text: summaryText }]
                    };
                }
            }
            return content;
        });
    }
    convertContentsToAnthropicMessages(contents, request) {
        let processedContents = contents;
        // Handle JSON generation requests by modifying the first user message
        if (request.config?.responseMimeType === 'application/json' && request.config?.responseSchema) {
            const jsonInstruction = `You must respond with valid JSON only. No additional text, explanations, or formatting. The response must conform to this schema: ${JSON.stringify(request.config.responseSchema)}`;
            // Find the first user message and prepend the JSON instruction
            processedContents = contents.map((content, index) => {
                if (index === 0 && content.role === 'user' && content.parts) {
                    return {
                        ...content,
                        parts: [
                            { text: jsonInstruction },
                            ...content.parts
                        ]
                    };
                }
                return content;
            });
        }
        const messages = processedContents.map((content) => {
            const anthropicContent = [];
            if (content.parts) {
                for (const part of content.parts) {
                    if ('text' in part && part.text) {
                        anthropicContent.push({ type: 'text', text: part.text });
                    }
                    else if ('functionResponse' in part && part.functionResponse) {
                        // Note: functionResponse parts should have been converted to text by convertToolResultsToTextForAnthropic
                        // If reach here, it means the conversion didn't happen - fallback to text
                        const response = typeof part.functionResponse.response === 'string'
                            ? part.functionResponse.response
                            : JSON.stringify(part.functionResponse.response);
                        anthropicContent.push({
                            type: 'text',
                            text: `Tool result from ${part.functionResponse.name}: ${response}`
                        });
                    }
                    else if ('functionCall' in part && part.functionCall) {
                        // Convert Gemini functionCall to Anthropic tool_use format (for assistant messages)
                        anthropicContent.push({
                            type: 'tool_use',
                            id: part.functionCall.id,
                            name: part.functionCall.name,
                            input: part.functionCall.args || {}
                        });
                    }
                    else {
                        // Fallback for other part types
                        anthropicContent.push({ type: 'text', text: JSON.stringify(part) });
                    }
                }
            }
            // Ensure messages have valid content
            if (anthropicContent.length === 0) {
                // Skip empty messages entirely
                return null;
            }
            // Ensure user messages have at least some text content if they only have tool_result
            if (content.role === 'user' && anthropicContent.length > 0) {
                const hasText = anthropicContent.some(item => item.type === 'text' && item.text?.trim());
                const hasToolResult = anthropicContent.some(item => item.type === 'tool_result');
                if (!hasText && hasToolResult) {
                    // Add minimal text content for tool result messages
                    anthropicContent.unshift({ type: 'text', text: 'Here are the tool results:' });
                }
            }
            return {
                role: content.role === 'model' ? 'assistant' : 'user',
                content: anthropicContent
            };
        }).filter(message => message !== null);
        const anthropicRequest = {
            model: request.model || this.config.model,
            messages,
            max_tokens: request.config?.maxOutputTokens || 2048,
            temperature: request.config?.temperature || 0.7,
            top_p: request.config?.topP || 1,
        };
        // Convert Gemini tools to Anthropic format
        if (request.config?.tools && request.config.tools.length > 0) {
            const anthropicTools = [];
            for (const tool of request.config.tools) {
                if ('functionDeclarations' in tool && tool.functionDeclarations) {
                    for (const funcDecl of tool.functionDeclarations) {
                        anthropicTools.push({
                            name: funcDecl.name,
                            description: funcDecl.description || '',
                            input_schema: funcDecl.parameters || { type: 'object', properties: {} },
                        });
                    }
                }
            }
            if (anthropicTools.length > 0) {
                anthropicRequest.tools = anthropicTools;
            }
        }
        return anthropicRequest;
    }
    convertFromAnthropicFormat(data, isStream = false, toolCallAccumulator) {
        // Handle streaming events
        if (isStream) {
            return this.handleAnthropicStreamingEvent(data, toolCallAccumulator);
        }
        // Handle non-streaming response
        let text = '';
        const functionCalls = [];
        // Extract text and tool calls from content array
        if (data.content && Array.isArray(data.content)) {
            for (const contentBlock of data.content) {
                if (contentBlock.type === 'text') {
                    text += contentBlock.text || '';
                }
                else if (contentBlock.type === 'tool_use') {
                    functionCalls.push({
                        id: contentBlock.id,
                        name: contentBlock.name,
                        args: contentBlock.input || {},
                    });
                }
            }
        }
        const candidate = {
            content: {
                parts: [{ text }],
                role: 'model',
            },
            finishReason: data.stop_reason === 'tool_use' ? 'tool_calls' : data.stop_reason || 'STOP',
            index: 0,
        };
        const usageMetadata = {
            promptTokenCount: data.usage?.input_tokens || 0,
            candidatesTokenCount: data.usage?.output_tokens || 0,
            totalTokenCount: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        };
        return {
            candidates: [candidate],
            usageMetadata,
            text,
            data: undefined,
            functionCalls,
            executableCode: undefined,
            codeExecutionResult: undefined,
        };
    }
    handleAnthropicStreamingEvent(data, toolCallAccumulator) {
        // Handle different streaming event types
        if (data.type === 'content_block_delta') {
            if (data.delta?.type === 'text_delta') {
                // Handle text streaming
                const text = data.delta.text || '';
                return this.createStreamingTextResponse(text);
            }
            else if (data.delta?.type === 'input_json_delta' && toolCallAccumulator) {
                // Handle tool call input streaming - accumulate partial JSON
                const blockIndex = data.index || 0;
                const partialJson = data.delta.partial_json || '';
                // Find the tool call by index (need to track this from content_block_start)
                const indexKey = `index_${blockIndex}`;
                for (const [key, accumulated] of toolCallAccumulator.entries()) {
                    if (key === indexKey) {
                        accumulated.input += partialJson;
                        break;
                    }
                }
                // Don't yield during accumulation
                return null;
            }
        }
        else if (data.type === 'content_block_start' && toolCallAccumulator) {
            // Handle tool call start
            if (data.content_block?.type === 'tool_use') {
                const toolCall = data.content_block;
                const blockIndex = data.index || 0;
                const indexKey = `index_${blockIndex}`;
                toolCallAccumulator.set(indexKey, {
                    id: toolCall.id,
                    name: toolCall.name,
                    input: '',
                });
                return null;
            }
        }
        else if (data.type === 'message_stop') {
            // End of message - don't yield anything here, let the caller handle accumulated tool calls
            return null;
        }
        else if (data.type === 'message_start' && data.message?.usage) {
            // Message start event might contain usage data
            const usageMetadata = {
                promptTokenCount: data.message.usage.input_tokens || 0,
                candidatesTokenCount: data.message.usage.output_tokens || 0,
                totalTokenCount: (data.message.usage.input_tokens || 0) + (data.message.usage.output_tokens || 0),
            };
            return {
                candidates: [],
                usageMetadata,
                text: '',
                data: undefined,
                functionCalls: [],
                executableCode: undefined,
                codeExecutionResult: undefined,
            };
        }
        else if (data.type === 'message_delta' && data.usage) {
            // Message delta event might contain incremental usage data
            const usageMetadata = {
                promptTokenCount: 0,
                candidatesTokenCount: data.usage.output_tokens || 0,
                totalTokenCount: data.usage.output_tokens || 0,
            };
            return {
                candidates: [],
                usageMetadata,
                text: '',
                data: undefined,
                functionCalls: [],
                executableCode: undefined,
                codeExecutionResult: undefined,
            };
        }
        return null;
    }
    createStreamingTextResponse(text) {
        const candidate = {
            content: {
                parts: [{ text }],
                role: 'model',
            },
            finishReason: 'STOP',
            index: 0,
        };
        return {
            candidates: [candidate],
            usageMetadata: {
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
            },
            text,
            data: undefined,
            functionCalls: [],
            executableCode: undefined,
            codeExecutionResult: undefined,
        };
    }
    convertAccumulatedAnthropicToolCallsToGemini(toolCalls) {
        const functionCalls = [];
        for (const toolCall of toolCalls) {
            try {
                const args = toolCall.input ? JSON.parse(toolCall.input) : {};
                functionCalls.push({
                    id: toolCall.id,
                    name: toolCall.name,
                    args,
                });
            }
            catch (e) {
                // Failed to parse accumulated tool call input - this can happen with malformed JSON
                // Include the tool call with empty args if parsing fails
                functionCalls.push({
                    id: toolCall.id,
                    name: toolCall.name,
                    args: {},
                });
            }
        }
        if (functionCalls.length === 0) {
            return null;
        }
        const candidate = {
            content: {
                parts: [{ text: '' }],
                role: 'model',
            },
            finishReason: 'tool_calls',
            index: 0,
        };
        return {
            candidates: [candidate],
            usageMetadata: {
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
            },
            text: '',
            data: undefined,
            functionCalls,
            executableCode: undefined,
            codeExecutionResult: undefined,
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
//# sourceMappingURL=anthropicContentGenerator.js.map