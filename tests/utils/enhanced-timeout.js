#!/usr/bin/env node

/**
 * Enhanced Timeout and Error Handling Utilities
 * 
 * Provides progressive timeout warnings and enhanced error handling
 * for LM Studio tool calling operations.
 */

/**
 * Creates a progressive timeout with warnings at specified intervals
 * @param {number} timeoutMs - Total timeout in milliseconds  
 * @param {Function} warningCallback - Called with warning messages
 * @returns {Object} - Object with signal and cleanup function
 */
export function createProgressiveTimeout(timeoutMs, warningCallback) {
    const controller = new AbortController();
    const warnings = [];
    
    // Set warning points (50%, 75%, 90% of timeout)
    const warningPoints = [
        { threshold: 0.5, message: `⏰ Tool calling taking longer than expected (${Math.round(timeoutMs * 0.5 / 1000)}s elapsed)...` },
        { threshold: 0.75, message: `⚠️  Tool calling performance degraded (${Math.round(timeoutMs * 0.75 / 1000)}s elapsed)...` },
        { threshold: 0.9, message: `🚨 Tool calling may timeout soon (${Math.round(timeoutMs * 0.9 / 1000)}s elapsed)...` }
    ];
    
    const startTime = Date.now();
    
    // Set up warning timers
    warningPoints.forEach(point => {
        const warningTime = timeoutMs * point.threshold;
        const timer = setTimeout(() => {
            const elapsed = Date.now() - startTime;
            if (!controller.signal.aborted && warningCallback) {
                warningCallback(point.message, elapsed);
            }
        }, warningTime);
        
        warnings.push(timer);
    });
    
    // Set final timeout
    const timeoutTimer = setTimeout(() => {
        controller.abort();
    }, timeoutMs);
    
    const cleanup = () => {
        warnings.forEach(timer => clearTimeout(timer));
        clearTimeout(timeoutTimer);
    };
    
    return {
        signal: controller.signal,
        cleanup,
        controller
    };
}

/**
 * Enhanced fetch with progressive timeout and detailed error handling
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds (default: 15000)
 * @param {Function} warningCallback - Optional warning callback
 * @returns {Promise} - Enhanced fetch promise
 */
export async function fetchWithProgressiveTimeout(url, options = {}, timeoutMs = 15000, warningCallback) {
    const { signal, cleanup } = createProgressiveTimeout(timeoutMs, warningCallback);
    
    try {
        // Merge the progressive timeout signal with any existing signal
        const mergedOptions = {
            ...options,
            signal: signal
        };
        
        const startTime = Date.now();
        const response = await fetch(url, mergedOptions);
        const duration = Date.now() - startTime;
        
        cleanup();
        
        return {
            response,
            duration,
            success: true
        };
        
    } catch (error) {
        cleanup();
        
        const duration = Date.now() - performance.now();
        
        // Enhanced error categorization
        let errorType = 'unknown';
        let recommendation = '';
        
        if (error.name === 'AbortError') {
            errorType = 'timeout';
            recommendation = `Consider increasing timeout beyond ${timeoutMs}ms or check model warm-up status`;
        } else if (error.message.includes('fetch failed')) {
            errorType = 'network';
            recommendation = 'Check LM Studio server is running and accessible';
        } else if (error.message.includes('401')) {
            errorType = 'authentication';
            recommendation = 'Verify API key and authentication configuration';
        } else if (error.message.includes('404')) {
            errorType = 'not_found';
            recommendation = 'Check model availability and endpoint URL';
        }
        
        return {
            response: null,
            duration,
            success: false,
            error: {
                type: errorType,
                message: error.message,
                recommendation,
                originalError: error
            }
        };
    }
}

/**
 * Tool calling specific error handler with context-aware messaging
 * @param {Object} error - Error object from fetchWithProgressiveTimeout
 * @param {string} modelName - Model being used
 * @param {Object} toolPayload - Tool calling payload for debugging
 */
export function handleToolCallingError(error, modelName, toolPayload) {
    console.log(`❌ Tool calling failed with ${modelName}:`);
    console.log(`   Error Type: ${error.type}`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Recommendation: ${error.recommendation}`);
    
    // Context-specific recommendations
    if (error.type === 'timeout') {
        console.log('\n🔧 Timeout Troubleshooting:');
        console.log('   1. Check if this is the first tool call (warm-up delay expected)');
        console.log('   2. Consider using temperature 0.7 for better performance');
        console.log('   3. Verify model is fully loaded in LM Studio');
        console.log('   4. Try simpler tool schemas for testing');
    } else if (error.type === 'authentication') {
        console.log('\n🔧 Authentication Troubleshooting:');
        console.log('   1. Verify Authorization header: "Bearer lm-studio"');
        console.log('   2. Check LM Studio API is enabled');
        console.log('   3. Confirm base URL: http://127.0.0.1:1234/v1');
    } else if (error.type === 'network') {
        console.log('\n🔧 Network Troubleshooting:');
        console.log('   1. Confirm LM Studio is running on port 1234');
        console.log('   2. Test basic connectivity: curl http://127.0.0.1:1234/v1/models');
        console.log('   3. Check firewall and network settings');
    }
    
    if (toolPayload) {
        console.log('\n📋 Debug Information:');
        console.log(`   Model: ${toolPayload.model}`);
        console.log(`   Tools: ${toolPayload.tools?.length || 0}`);
        console.log(`   Temperature: ${toolPayload.temperature}`);
        console.log(`   Max Tokens: ${toolPayload.max_tokens}`);
    }
}

/**
 * Performance analysis and recommendations
 * @param {number} duration - Response time in milliseconds
 * @param {boolean} isFirstCall - Whether this is the first call (warm-up)
 * @param {string} modelName - Model name for context
 */
export function analyzePerformance(duration, isFirstCall, modelName) {
    console.log(`⏱️  Response time: ${duration}ms`);
    
    if (isFirstCall && duration > 10000) {
        console.log('📊 First call detected - warm-up delay is normal');
        console.log('💡 Subsequent calls should be faster (2-4 seconds typically)');
    } else if (duration > 15000) {
        console.log('⚠️  Slow response detected');
        console.log('💡 Consider optimizing parameters:');
        console.log('   - Temperature: 0.7 (vs lower values)');
        console.log('   - Tool choice: "required" (vs "auto")');
        console.log('   - Max tokens: 100-150 for tool calls');
    } else if (duration < 5000) {
        console.log('✅ Excellent performance!');
    } else {
        console.log('✅ Good performance');
    }
}

export default {
    createProgressiveTimeout,
    fetchWithProgressiveTimeout,
    handleToolCallingError,
    analyzePerformance
};