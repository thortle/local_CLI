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
 * Map common parameter name variations to standardized names
 */
function normalizeParameterNames(toolName, args) {
    if (!args || typeof args !== 'object') {
        return args;
    }
    // Create a normalized copy
    const normalized = { ...args };
    // Handle common parameter variations based on tool name
    switch (toolName) {
        case 'read_file':
            // Map file_path or path to absolute_path
            if ('file_path' in normalized && !('absolute_path' in normalized)) {
                normalized.absolute_path = normalized.file_path;
                delete normalized.file_path;
            }
            if ('path' in normalized && !('absolute_path' in normalized)) {
                normalized.absolute_path = normalized.path;
                delete normalized.path;
            }
            break;
        case 'write_file':
            // Map path or absolute_path to file_path
            if ('absolute_path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.absolute_path;
                delete normalized.absolute_path;
            }
            if ('path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.path;
                delete normalized.path;
            }
            // Map text to content for write_file
            if ('text' in normalized && !('content' in normalized)) {
                normalized.content = normalized.text;
                delete normalized.text;
            }
            // Map contents to content for write_file
            if ('contents' in normalized && !('content' in normalized)) {
                normalized.content = normalized.contents;
                delete normalized.contents;
            }
            // Map data to content for write_file
            if ('data' in normalized && !('content' in normalized)) {
                normalized.content = normalized.data;
                delete normalized.data;
            }
            // Log for debugging
            console.log(`[DEBUG] write_file parameters after normalization:`, JSON.stringify(normalized));
            break;
        case 'replace':
        case 'edit': // Some models may call it 'edit' instead of 'replace'
        case 'edit_file': // Some models may call it 'edit_file' instead of 'replace'
            // Map path or absolute_path to file_path
            if ('absolute_path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.absolute_path;
                delete normalized.absolute_path;
            }
            if ('path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.path;
                delete normalized.path;
            }
            // Map original_string to old_string
            if ('original_string' in normalized && !('old_string' in normalized)) {
                normalized.old_string = normalized.original_string;
                delete normalized.original_string;
            }
            // Map original_text to old_string
            if ('original_text' in normalized && !('old_string' in normalized)) {
                normalized.old_string = normalized.original_text;
                delete normalized.original_text;
            }
            // Map replacement_string to new_string
            if ('replacement_string' in normalized && !('new_string' in normalized)) {
                normalized.new_string = normalized.replacement_string;
                delete normalized.replacement_string;
            }
            // Map replacement_text to new_string
            if ('replacement_text' in normalized && !('new_string' in normalized)) {
                normalized.new_string = normalized.replacement_text;
                delete normalized.replacement_text;
            }
            // Map replacement to new_string
            if ('replacement' in normalized && !('new_string' in normalized)) {
                normalized.new_string = normalized.replacement;
                delete normalized.replacement;
            }
            break;
        case 'append':
        case 'append_file':
        case 'append_to_file':
            // These tools don't exist in Gemini CLI, so we need to convert them to write_file
            // This will need special handling in the tool name normalization
            // For now, just normalize the parameters as if it were write_file
            if ('absolute_path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.absolute_path;
                delete normalized.absolute_path;
            }
            if ('path' in normalized && !('file_path' in normalized)) {
                normalized.file_path = normalized.path;
                delete normalized.path;
            }
            if ('text' in normalized && !('content' in normalized)) {
                normalized.content = normalized.text;
                delete normalized.text;
            }
            if ('contents' in normalized && !('content' in normalized)) {
                normalized.content = normalized.contents;
                delete normalized.contents;
            }
            if ('data' in normalized && !('content' in normalized)) {
                normalized.content = normalized.data;
                delete normalized.data;
            }
            break;
    }
    return normalized;
}
/**
 * Generic HTTP-based content generator for OpenAI-compatible APIs
 */
export class OpenAICompatibleContentGenerator {
    config;
    constructor(config) {
        this.config = config;
    }
    async generateContent(request) {
        const openAIRequest = this.convertToOpenAIFormat(request);
        const url = `${this.config.baseUrl}/chat/completions`;
        // Debug logging - disabled for production
        // console.error('[DEBUG] OpenAI Compatible Request:', {
        //   url,
        //   hasApiKey: !!this.config.apiKey,
        //   apiKeyLength: this.config.apiKey?.length,
        //   apiKeyPrefix: this.config.apiKey?.substring(0, 10),
        //   model: openAIRequest.model,
        //   baseUrl: this.config.baseUrl,
        // });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                ...this.config.customHeaders,
            },
            body: JSON.stringify(openAIRequest),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const result = this.convertFromOpenAIFormat(data);
        if (!result) {
            throw new Error('Failed to convert OpenAI response');
        }
        return result;
    }
    async generateContentStream(request) {
        return this.generateContentStreamInternal(request);
    }
    async *generateContentStreamInternal(request) {
        const openAIRequest = { ...this.convertToOpenAIFormat(request), stream: true };
        const url = `${this.config.baseUrl}/chat/completions`;
        // Debug logging - disabled for production
        // const isAllAsterisks = this.config.apiKey?.split('').every(char => char === '*');
        // console.error('[DEBUG] OpenAI Compatible Stream Request:', {
        //   url,
        //   hasApiKey: !!this.config.apiKey,
        //   apiKeyLength: this.config.apiKey?.length,
        //   apiKeyPrefix: this.config.apiKey?.substring(0, 10),
        //   isApiKeyAllAsterisks: isAllAsterisks,
        //   actualFirstChar: this.config.apiKey?.[0],
        //   authHeaderPreview: `Bearer ${this.config.apiKey?.substring(0, 10)}...`,
        //   model: openAIRequest.model,
        //   baseUrl: this.config.baseUrl,
        //   stream: true,
        // });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                ...this.config.customHeaders,
            },
            body: JSON.stringify(openAIRequest),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            // console.error('[DEBUG] Stream API Error Response:', {
            //   status: response.status,
            //   statusText: response.statusText,
            //   errorText,
            //   headers: Object.fromEntries(response.headers.entries()),
            // });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
                        catch (e) {
                            // Skip invalid JSON - this is expected for some OpenAI streaming events
                            // Don't log this as it's normal behavior
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    async countTokens(request) {
        // Approximate token counting - most APIs don't provide exact token counting
        const contents = normalizeContents(request.contents);
        const text = this.extractTextFromContents(contents);
        const approximateTokens = Math.ceil(text.length / 4); // Rough approximation
        return {
            totalTokens: approximateTokens,
        };
    }
    async embedContent(request) {
        const contents = normalizeContents(request.contents);
        const text = this.extractTextFromContents(contents);
        const response = await fetch(`${this.config.baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                ...this.config.customHeaders,
            },
            body: JSON.stringify({
                input: text,
                model: request.model || 'text-embedding-ada-002',
            }),
            signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined,
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return {
            embeddings: [{
                    values: data.data[0].embedding,
                }],
        };
    }
    convertToOpenAIFormat(request) {
        const contents = normalizeContents(request.contents);
        let messages = contents.map((content) => ({
            role: content.role === 'model' ? 'assistant' : content.role,
            content: content.parts?.map((part) => {
                if ('text' in part) {
                    return part.text;
                }
                // Handle other part types as needed
                return JSON.stringify(part);
            }).join('\n') || '',
        }));
        // Handle JSON generation requests by adding a system message
        if (request.config?.responseMimeType === 'application/json' && request.config?.responseSchema) {
            const jsonInstruction = `You must respond with valid JSON only. No additional text, explanations, or formatting. The response must conform to this schema: ${JSON.stringify(request.config.responseSchema)}`;
            // Add system message at the beginning
            messages = [
                { role: 'system', content: jsonInstruction },
                ...messages
            ];
        }
        const openAIRequest = {
            model: request.model || this.config.model,
            messages,
            temperature: request.config?.temperature || 0.7,
            max_tokens: request.config?.maxOutputTokens || 2048,
            top_p: request.config?.topP || 1,
            stream: false,
        };
        // Convert Gemini tools to OpenAI format
        if (request.config?.tools && request.config.tools.length > 0) {
            const openAITools = [];
            for (const tool of request.config.tools) {
                if ('functionDeclarations' in tool && tool.functionDeclarations) {
                    for (const funcDecl of tool.functionDeclarations) {
                        // DeepSeek-specific schema simplification
                        let parameters = funcDecl.parameters || { type: 'object', properties: {} };
                        if (this.config.baseUrl?.includes('deepseek')) {
                            parameters = this.simplifySchemaForDeepSeek(parameters);
                        }
                        openAITools.push({
                            type: 'function',
                            function: {
                                name: funcDecl.name,
                                description: funcDecl.description || '',
                                parameters: parameters,
                            },
                        });
                    }
                }
            }
            if (openAITools.length > 0) {
                openAIRequest.tools = openAITools;
                openAIRequest.tool_choice = 'auto';
            }
        }
        return openAIRequest;
    }
    convertFromOpenAIFormat(data, isStream = false, toolCallAccumulator, indexToIdMap) {
        const choice = data.choices?.[0];
        if (!choice) {
            throw new Error('No choices in response');
        }
        const text = isStream
            ? choice.delta?.content || ''
            : choice.message?.content || '';
        // Parse function calls from OpenAI format to Gemini format
        const functionCalls = [];
        const message = isStream ? choice.delta : choice.message;
        if (message?.tool_calls && Array.isArray(message.tool_calls)) {
            for (const toolCall of message.tool_calls) {
                if ((toolCall.type === 'function' || isStream) && toolCall.function) {
                    if (isStream && toolCallAccumulator && indexToIdMap) {
                        // Handle streaming tool calls - accumulate arguments
                        const index = toolCall.index || 0;
                        // If this chunk has an ID, store the mapping
                        if (toolCall.id) {
                            indexToIdMap.set(index, toolCall.id);
                        }
                        // Get the actual call ID from the mapping or use the current ID
                        const callId = indexToIdMap.get(index) || toolCall.id || `call_${index}`;
                        if (!toolCallAccumulator.has(callId)) {
                            toolCallAccumulator.set(callId, {
                                id: callId,
                                name: toolCall.function.name || '',
                                arguments: ''
                            });
                        }
                        const accumulated = toolCallAccumulator.get(callId);
                        if (toolCall.function.name) {
                            accumulated.name = toolCall.function.name;
                        }
                        if (toolCall.function.arguments) {
                            accumulated.arguments += toolCall.function.arguments;
                        }
                        // Don't yield function calls during streaming - wait for completion
                        continue;
                    }
                    else {
                        // Handle non-streaming tool calls
                        try {
                            const args = typeof toolCall.function.arguments === 'string'
                                ? JSON.parse(toolCall.function.arguments)
                                : toolCall.function.arguments || {};
                            // Normalize tool name: convert hyphens to underscores
                            // Some models (like DeepSeek) may use hyphens in tool names
                            let normalizedName = toolCall.function.name.replace(/-/g, '_');
                            // Map tool names to Gemini's expected names
                            if (normalizedName === 'edit_file' || normalizedName === 'edit') {
                                normalizedName = 'replace';
                            }
                            else if (normalizedName === 'append' || normalizedName === 'append_file' || normalizedName === 'append_to_file') {
                                // Append doesn't exist, but we can't easily convert to write_file here
                                // as we'd need to read the existing content first
                                console.log(`[WARNING] Tool ${normalizedName} not supported, treating as write_file`);
                                normalizedName = 'write_file';
                            }
                            // Log original args for debugging
                            if (normalizedName === 'write_file') {
                                console.log(`[DEBUG] write_file original args:`, JSON.stringify(args));
                            }
                            // Normalize parameter names for better compatibility
                            const normalizedArgs = normalizeParameterNames(normalizedName, args);
                            functionCalls.push({
                                id: toolCall.id,
                                name: normalizedName,
                                args: normalizedArgs,
                            });
                        }
                        catch (e) {
                            // Failed to parse tool call arguments - this can happen with malformed JSON
                            // Include the tool call with empty args if parsing fails
                            // Normalize tool name: convert hyphens to underscores
                            let normalizedName = toolCall.function.name.replace(/-/g, '_');
                            // Map tool names to Gemini's expected names
                            if (normalizedName === 'edit_file' || normalizedName === 'edit') {
                                normalizedName = 'replace';
                            }
                            else if (normalizedName === 'append' || normalizedName === 'append_file' || normalizedName === 'append_to_file') {
                                console.log(`[WARNING] Tool ${normalizedName} not supported, treating as write_file`);
                                normalizedName = 'write_file';
                            }
                            // Even with empty args, apply normalization for consistency
                            const normalizedArgs = normalizeParameterNames(normalizedName, {});
                            functionCalls.push({
                                id: toolCall.id,
                                name: normalizedName,
                                args: normalizedArgs,
                            });
                        }
                    }
                }
            }
        }
        // For streaming, only return response if there's text content
        if (isStream && !text && functionCalls.length === 0) {
            return null;
        }
        const candidate = {
            content: {
                parts: [{ text }],
                role: 'model',
            },
            finishReason: choice.finish_reason || 'STOP',
            index: 0,
        };
        const usageMetadata = {
            promptTokenCount: data.usage?.prompt_tokens || 0,
            candidatesTokenCount: data.usage?.completion_tokens || 0,
            totalTokenCount: data.usage?.total_tokens || 0,
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
    convertAccumulatedToolCallsToGemini(toolCalls) {
        const functionCalls = [];
        for (const toolCall of toolCalls) {
            try {
                const args = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
                // Normalize tool name: convert hyphens to underscores
                let normalizedName = toolCall.name.replace(/-/g, '_');
                // Map tool names to Gemini's expected names
                if (normalizedName === 'edit_file' || normalizedName === 'edit') {
                    normalizedName = 'replace';
                }
                else if (normalizedName === 'append' || normalizedName === 'append_file' || normalizedName === 'append_to_file') {
                    console.log(`[WARNING] Tool ${normalizedName} not supported, treating as write_file`);
                    normalizedName = 'write_file';
                }
                // Normalize parameter names for better compatibility
                const normalizedArgs = normalizeParameterNames(normalizedName, args);
                functionCalls.push({
                    id: toolCall.id,
                    name: normalizedName,
                    args: normalizedArgs,
                });
            }
            catch (e) {
                // Failed to parse accumulated tool call arguments - this can happen with malformed JSON
                // Include the tool call with empty args if parsing fails
                // Normalize tool name: convert hyphens to underscores
                let normalizedName = toolCall.name.replace(/-/g, '_');
                // Map tool names to Gemini's expected names
                if (normalizedName === 'edit_file' || normalizedName === 'edit') {
                    normalizedName = 'replace';
                }
                else if (normalizedName === 'append' || normalizedName === 'append_file' || normalizedName === 'append_to_file') {
                    console.log(`[WARNING] Tool ${normalizedName} not supported, treating as write_file`);
                    normalizedName = 'write_file';
                }
                // Even with empty args, apply normalization for consistency
                const normalizedArgs = normalizeParameterNames(normalizedName, {});
                functionCalls.push({
                    id: toolCall.id,
                    name: normalizedName,
                    args: normalizedArgs,
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
        const usageMetadata = {
            promptTokenCount: 0,
            candidatesTokenCount: 0,
            totalTokenCount: 0,
        };
        return {
            candidates: [candidate],
            usageMetadata,
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
    /**
     * Simplify complex JSON schemas for DeepSeek compatibility
     * DeepSeek has stricter schema validation than OpenAI/Gemini
     */
    simplifySchemaForDeepSeek(schema) {
        if (!schema || typeof schema !== 'object') {
            return { type: 'object', properties: {} };
        }
        // Create a simplified copy
        const simplified = { ...schema };
        // Normalize type names from uppercase to lowercase (Playwright MCP uses uppercase)
        if (simplified.type) {
            if (typeof simplified.type === 'string') {
                simplified.type = simplified.type.toLowerCase();
            }
            else if (Array.isArray(simplified.type)) {
                simplified.type = simplified.type.map((t) => typeof t === 'string' ? t.toLowerCase() : t);
            }
        }
        // Remove complex schema features that DeepSeek rejects
        delete simplified.anyOf;
        delete simplified.oneOf;
        delete simplified.allOf;
        delete simplified.not;
        delete simplified.$defs;
        delete simplified.definitions;
        delete simplified.pattern;
        delete simplified.const;
        delete simplified.enum; // Keep only if absolutely necessary
        // Remove unsupported formats (keep only basic ones)
        if (simplified.format && !['date-time', 'email', 'uri'].includes(simplified.format)) {
            delete simplified.format;
        }
        // Simplify properties recursively
        if (simplified.properties && typeof simplified.properties === 'object') {
            for (const [key, propSchema] of Object.entries(simplified.properties)) {
                if (typeof propSchema === 'object' && propSchema !== null) {
                    simplified.properties[key] = this.simplifySchemaForDeepSeek(propSchema);
                }
            }
        }
        // Simplify items if it's an array schema
        if (simplified.items && typeof simplified.items === 'object') {
            simplified.items = this.simplifySchemaForDeepSeek(simplified.items);
        }
        // Simplify additionalProperties
        if (simplified.additionalProperties && typeof simplified.additionalProperties === 'object') {
            simplified.additionalProperties = this.simplifySchemaForDeepSeek(simplified.additionalProperties);
        }
        return simplified;
    }
}
//# sourceMappingURL=openaiCompatibleContentGenerator.js.map