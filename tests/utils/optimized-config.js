#!/usr/bin/env node

/**
 * Optimized LM Studio Tool Calling Configuration Profiles
 * 
 * Based on empirical testing with mistralai/devstral-small-2507,
 * these configurations provide optimal performance for different scenarios.
 */

export const LM_STUDIO_TOOL_CALLING_PROFILES = {
    // Optimal configuration for mistralai/devstral-small-2507
    'mistralai/devstral-small-2507': {
        // Optimized parameters based on testing
        temperature: 0.7,        // 58% faster than 0.1
        max_tokens: 100,         // Optimal for tool responses
        tool_choice: 'required', // Most reliable for tool calls
        
        // Adaptive timeout strategy
        timeouts: {
            first_call: 25000,   // 25s for warm-up/first call
            subsequent: 10000,   // 10s for warmed-up calls
            default: 15000       // 15s default fallback
        },
        
        // Performance expectations
        performance: {
            first_call_target: 15000,   // 15s target for first call
            subsequent_target: 5000,     // 5s target for subsequent
            excellent_threshold: 3000    // <3s is excellent
        },
        
        // Model-specific recommendations
        recommendations: {
            warm_up: 'First call may take 10-20 seconds (normal warm-up)',
            optimal_use: 'Use temperature 0.7 for best tool calling performance',
            tool_format: 'Supports full OpenAI tool calling specification',
            concurrent_limits: 'Single model instance - no concurrent tool calls'
        }
    },
    
    // Generic profile for other models
    'default': {
        temperature: 0.5,
        max_tokens: 150,
        tool_choice: 'auto',
        
        timeouts: {
            first_call: 30000,
            subsequent: 15000,
            default: 20000
        },
        
        performance: {
            first_call_target: 20000,
            subsequent_target: 10000,
            excellent_threshold: 5000
        },
        
        recommendations: {
            warm_up: 'First call may be slower due to model loading',
            optimal_use: 'Test different temperature values for your model',
            tool_format: 'Verify model supports OpenAI tool calling format',
            concurrent_limits: 'Check model documentation for concurrency limits'
        }
    }
};

/**
 * Get optimized configuration for a specific model
 * @param {string} modelName - The model identifier
 * @returns {Object} - Optimized configuration profile
 */
export function getOptimizedConfig(modelName) {
    // Check for exact match first
    if (LM_STUDIO_TOOL_CALLING_PROFILES[modelName]) {
        return LM_STUDIO_TOOL_CALLING_PROFILES[modelName];
    }
    
    // Check for partial matches (e.g., devstral models)
    if (modelName.includes('devstral') || modelName.includes('mistral')) {
        return LM_STUDIO_TOOL_CALLING_PROFILES['mistralai/devstral-small-2507'];
    }
    
    // Default fallback
    return LM_STUDIO_TOOL_CALLING_PROFILES['default'];
}

/**
 * Create optimized tool calling payload
 * @param {string} modelName - Model identifier
 * @param {Array} messages - Chat messages
 * @param {Array} tools - Tool definitions
 * @param {Object} overrides - Optional parameter overrides
 * @returns {Object} - Optimized payload
 */
export function createOptimizedPayload(modelName, messages, tools, overrides = {}) {
    const config = getOptimizedConfig(modelName);
    
    return {
        model: modelName,
        messages: messages,
        tools: tools,
        tool_choice: overrides.tool_choice || config.tool_choice,
        max_tokens: overrides.max_tokens || config.max_tokens,
        temperature: overrides.temperature || config.temperature,
        stream: false,
        ...overrides // Allow any additional overrides
    };
}

/**
 * Get adaptive timeout for tool calling
 * @param {string} modelName - Model identifier
 * @param {boolean} isFirstCall - Whether this is the first call
 * @returns {number} - Timeout in milliseconds
 */
export function getAdaptiveTimeout(modelName, isFirstCall = false) {
    const config = getOptimizedConfig(modelName);
    
    if (isFirstCall) {
        return config.timeouts.first_call;
    }
    
    return config.timeouts.subsequent;
}

/**
 * Analyze tool calling performance and provide feedback
 * @param {number} duration - Response time in milliseconds
 * @param {string} modelName - Model identifier
 * @param {boolean} isFirstCall - Whether this was the first call
 * @returns {Object} - Performance analysis
 */
export function analyzeToolCallingPerformance(duration, modelName, isFirstCall) {
    const config = getOptimizedConfig(modelName);
    const target = isFirstCall ? config.performance.first_call_target : config.performance.subsequent_target;
    const excellent = config.performance.excellent_threshold;
    
    let status = 'good';
    let message = 'Good performance';
    let recommendations = [];
    
    if (duration <= excellent) {
        status = 'excellent';
        message = 'Excellent performance!';
    } else if (duration <= target) {
        status = 'good';
        message = 'Good performance';
    } else if (duration <= target * 1.5) {
        status = 'acceptable';
        message = 'Acceptable performance';
        recommendations.push('Consider checking system load');
    } else {
        status = 'slow';
        message = 'Slow performance detected';
        recommendations.push('Consider optimizing parameters');
        recommendations.push('Check model warm-up status');
        recommendations.push('Verify system resources');
    }
    
    if (isFirstCall && duration > config.performance.first_call_target) {
        recommendations.push('First call warm-up delay is normal');
        recommendations.push('Subsequent calls should be faster');
    }
    
    return {
        status,
        message,
        duration,
        target,
        recommendations,
        config: config.recommendations
    };
}

export default {
    LM_STUDIO_TOOL_CALLING_PROFILES,
    getOptimizedConfig,
    createOptimizedPayload,
    getAdaptiveTimeout,
    analyzeToolCallingPerformance
};