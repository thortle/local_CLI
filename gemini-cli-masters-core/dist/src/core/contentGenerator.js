/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, } from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { DEFAULT_GEMINI_MODEL, getDefaultAnthropicModel, validateAnthropicModel } from '../config/models.js';
import { getEffectiveModel } from './modelCheck.js';
import { createCustomContentGenerator } from '../adapters/index.js';
function getProviderSpecificUserAgent(authType, version) {
    const platform = process.platform;
    const arch = process.arch;
    switch (authType) {
        case AuthType.USE_ANTHROPIC:
            return `AI-CLI-Anthropic/${version} (${platform}; ${arch})`;
        case AuthType.USE_OPENAI_COMPATIBLE:
            return `AI-CLI-OpenAI/${version} (${platform}; ${arch})`;
        case AuthType.USE_LOCAL_LLM:
            return `AI-CLI-Local/${version} (${platform}; ${arch})`;
        case AuthType.USE_LM_STUDIO:
            return `AI-CLI-LMStudio/${version} (${platform}; ${arch})`;
        case AuthType.USE_AZURE:
            return `AI-CLI-Azure/${version} (${platform}; ${arch})`;
        case AuthType.LOGIN_WITH_GOOGLE:
        case AuthType.USE_GEMINI:
        case AuthType.USE_VERTEX_AI:
        default:
            return `GeminiCLI/${version} (${platform}; ${arch})`;
    }
}
export var AuthType;
(function (AuthType) {
    AuthType["LOGIN_WITH_GOOGLE"] = "oauth-personal";
    AuthType["USE_GEMINI"] = "gemini-api-key";
    AuthType["USE_VERTEX_AI"] = "vertex-ai";
    AuthType["USE_OPENAI_COMPATIBLE"] = "openai-compatible";
    AuthType["USE_ANTHROPIC"] = "anthropic";
    AuthType["USE_LOCAL_LLM"] = "local-llm";
    AuthType["USE_LM_STUDIO"] = "lm-studio";
    AuthType["USE_AZURE"] = "azure";
})(AuthType || (AuthType = {}));
export async function createContentGeneratorConfig(model, authType, config) {
    // Debug log at the very beginning
    try {
        const fs = require('fs');
        const debugInfo = {
            timestamp: new Date().toISOString(),
            function: 'createContentGeneratorConfig',
            model,
            authType,
            hasConfig: !!config
        };
        fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Config Creation] ${JSON.stringify(debugInfo, null, 2)}\n`);
    }
    catch (e) {
        // Ignore file write errors
    }
    const apiKeys = config?.getApiKeys?.() || {};
    // Helper function to get value from environment or settings
    const getValue = (envKey, settingsKey) => process.env[envKey] || apiKeys[settingsKey];
    const geminiApiKey = getValue('GEMINI_API_KEY', 'geminiApiKey');
    const googleApiKey = getValue('GOOGLE_API_KEY', 'googleApiKey');
    const googleCloudProject = getValue('GOOGLE_CLOUD_PROJECT', 'googleCloudProject');
    const googleCloudLocation = getValue('GOOGLE_CLOUD_LOCATION', 'googleCloudLocation');
    // API keys for other providers
    const openaiApiKey = getValue('OPENAI_API_KEY', 'openaiApiKey');
    const anthropicApiKey = getValue('ANTHROPIC_API_KEY', 'anthropicApiKey');
    const localLlmApiKey = process.env.LOCAL_LLM_API_KEY; // Keep as env only for now
    const customBaseUrl = getValue('CUSTOM_BASE_URL', 'customBaseUrl');
    const localLlmModel = getValue('LOCAL_LLM_MODEL', 'localLlmModel');
    const customTimeout = process.env.CUSTOM_TIMEOUT;
    const azureApiKey = getValue('AZURE_API_KEY', 'azureApiKey');
    const azureEndpointUrl = getValue('AZURE_ENDPOINT_URL', 'azureEndpointUrl');
    const azureApiVersion = getValue('AZURE_API_VERSION', 'azureApiVersion');
    // Use runtime model from config if available, otherwise fallback to parameter or default
    const effectiveModel = config?.getModel?.() || model || DEFAULT_GEMINI_MODEL;
    const contentGeneratorConfig = {
        model: effectiveModel,
        authType,
        // Only set baseUrl for non-Anthropic auth types
        baseUrl: authType === AuthType.USE_ANTHROPIC ? undefined : customBaseUrl,
        timeout: customTimeout ? parseInt(customTimeout, 10) : undefined,
    };
    // if we are using google auth nothing else to validate for now
    if (authType === AuthType.LOGIN_WITH_GOOGLE) {
        return contentGeneratorConfig;
    }
    if (authType === AuthType.USE_GEMINI && geminiApiKey) {
        contentGeneratorConfig.apiKey = geminiApiKey;
        contentGeneratorConfig.model = await getEffectiveModel(contentGeneratorConfig.apiKey, contentGeneratorConfig.model);
        return contentGeneratorConfig;
    }
    if (authType === AuthType.USE_AZURE) {
        if (!azureApiKey || !azureEndpointUrl || !azureApiVersion) {
            throw new Error('AZURE_API_KEY, AZURE_ENDPOINT_URL, and AZURE_API_VERSION must be set for Azure auth type.');
        }
        contentGeneratorConfig.apiKey = azureApiKey;
        contentGeneratorConfig.baseUrl = azureEndpointUrl;
        contentGeneratorConfig.apiVersion = azureApiVersion;
        return contentGeneratorConfig;
    }
    // Vertex AI
    if (authType === AuthType.USE_VERTEX_AI &&
        !!googleApiKey &&
        googleCloudProject &&
        googleCloudLocation) {
        contentGeneratorConfig.apiKey = googleApiKey;
        contentGeneratorConfig.vertexai = true;
        contentGeneratorConfig.model = await getEffectiveModel(contentGeneratorConfig.apiKey, contentGeneratorConfig.model);
        return contentGeneratorConfig;
    }
    // OpenAI Compatible API (includes OpenAI, local LLMs with OpenAI-compatible endpoints)
    if (authType === AuthType.USE_OPENAI_COMPATIBLE) {
        if (!openaiApiKey) {
            throw new Error('OPENAI_API_KEY environment variable is required for openai-compatible auth type.');
        }
        contentGeneratorConfig.apiKey = openaiApiKey;
        contentGeneratorConfig.baseUrl = customBaseUrl || 'https://api.openai.com/v1';
        // Always use the openaiModel if it's been configured by the user
        const openaiModel = getValue('OPENAI_MODEL', 'openaiModel');
        if (openaiModel) {
            contentGeneratorConfig.model = openaiModel;
        }
        else if (effectiveModel.includes('gemini')) {
            // Fallback to a reasonable default for OpenAI-compatible providers
            contentGeneratorConfig.model = 'gpt-4o-mini';
        }
        else {
            contentGeneratorConfig.model = effectiveModel; // Use the specified model if it's not a Gemini model
        }
        return contentGeneratorConfig;
    }
    // Anthropic API
    if (authType === AuthType.USE_ANTHROPIC) {
        if (!anthropicApiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for anthropic auth type.');
        }
        contentGeneratorConfig.apiKey = anthropicApiKey;
        contentGeneratorConfig.baseUrl = 'https://api.anthropic.com';
        // Get saved model preference or use default
        const savedModel = getValue('ANTHROPIC_MODEL', 'anthropicModel');
        let selectedModel = savedModel || getDefaultAnthropicModel();
        // Validate the model
        if (!validateAnthropicModel(selectedModel)) {
            selectedModel = getDefaultAnthropicModel();
        }
        // Use Anthropic model names instead of Gemini model names
        if (effectiveModel.includes('gemini')) {
            contentGeneratorConfig.model = selectedModel;
        }
        else {
            // Allow override if specific model is requested
            contentGeneratorConfig.model = validateAnthropicModel(effectiveModel) ? effectiveModel : selectedModel;
        }
        return contentGeneratorConfig;
    }
    // Local LLM (custom endpoint)
    if (authType === AuthType.USE_LOCAL_LLM) {
        contentGeneratorConfig.apiKey = localLlmApiKey || 'dummy-key'; // Some local LLMs don't need real API keys
        contentGeneratorConfig.baseUrl = customBaseUrl || 'http://localhost:11434';
        // Use the user-specified local LLM model, or fallback to a default
        if (localLlmModel) {
            contentGeneratorConfig.model = localLlmModel;
        }
        else if (effectiveModel && !effectiveModel.includes('gemini') && !effectiveModel.includes('google')) {
            contentGeneratorConfig.model = effectiveModel;
        }
        else {
            // Default fallback if no model specified
            contentGeneratorConfig.model = 'llama3.1:8b';
        }
        return contentGeneratorConfig;
    }
    return contentGeneratorConfig;
}
export async function createContentGenerator(config, sessionId) {
    // Debug log to see what's happening
    try {
        const fs = require('fs');
        const debugInfo = {
            timestamp: new Date().toISOString(),
            authType: config.authType,
            model: config.model,
            hasApiKey: !!config.apiKey,
            baseUrl: config.baseUrl
        };
        fs.appendFileSync('/tmp/gemini-cli-debug.log', `[Content Generator Creation] ${JSON.stringify(debugInfo, null, 2)}\n`);
    }
    catch (e) {
        // Ignore file write errors
    }
    const version = process.env.CLI_VERSION || process.version;
    const httpOptions = {
        headers: {
            'User-Agent': getProviderSpecificUserAgent(config.authType, version),
        },
    };
    if (config.authType === AuthType.LOGIN_WITH_GOOGLE) {
        return createCodeAssistContentGenerator(httpOptions, config.authType, sessionId);
    }
    // Google Gemini API and Vertex AI
    if (config.authType === AuthType.USE_GEMINI ||
        config.authType === AuthType.USE_VERTEX_AI) {
        const googleGenAI = new GoogleGenAI({
            apiKey: config.apiKey === '' ? undefined : config.apiKey,
            vertexai: config.vertexai,
            httpOptions,
        });
        return googleGenAI.models;
    }
    // All other providers (OpenAI Compatible, Anthropic, Local LLMs, Azure)
    if (!config.authType) {
        throw new Error('Auth type is required');
    }
    return createCustomContentGenerator(config.authType, config);
}
//# sourceMappingURL=contentGenerator.js.map