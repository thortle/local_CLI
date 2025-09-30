#!/usr/bin/env node

/**
 * Comprehensive LM Studio Tool Calling Optimization Validation
 */

import { fetchWithProgressiveTimeout, handleToolCallingError } from '../utils/enhanced-timeout.js';
import { createOptimizedPayload, getAdaptiveTimeout, analyzeToolCallingPerformance } from '../utils/optimized-config.js';

console.log('🚀 Testing Optimized LM Studio Tool Calling Configuration...\n');

async function testOptimizedConfiguration() {
    try {
        console.log('1️⃣ Initializing optimized test environment...');
        
        const baseUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
        
        const modelsResponse = await fetch(`${baseUrl}/v1/models`);
        if (!modelsResponse.ok) {
            console.log('❌ LM Studio not accessible');
            return false;
        }
        
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.data || [];
        
        if (availableModels.length === 0) {
            console.log('❌ No models loaded in LM Studio');
            return false;
        }
        
        const targetModel = availableModels.find(m => m.id.includes('devstral') || m.id.includes('mistral')) || availableModels[0];
        
        console.log(`🎯 Testing optimized configuration with: ${targetModel.id}`);
        
        const simpleWeatherTool = {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get weather information for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state/country"
                        }
                    },
                    "required": ["location"]
                }
            }
        };
        
        console.log('\n2️⃣ Testing optimized simple tool calling...');
        
        const simpleMessages = [{
            "role": "user",
            "content": "What's the weather like in San Francisco? Please use the weather tool."
        }];
        
        const simplePayload = createOptimizedPayload(
            targetModel.id,
            simpleMessages,
            [simpleWeatherTool]
        );
        
        console.log(`📋 Optimized payload: temperature=${simplePayload.temperature}, max_tokens=${simplePayload.max_tokens}, tool_choice=${simplePayload.tool_choice}`);
        
        const warningCallback = (message) => console.log(`   ${message}`);
        const simpleTimeout = getAdaptiveTimeout(targetModel.id, true);
        console.log(`⏰ Using adaptive timeout: ${simpleTimeout}ms (first call)`);
        
        const simpleResult = await fetchWithProgressiveTimeout(
            `${baseUrl}/v1/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(simplePayload)
            },
            simpleTimeout,
            warningCallback
        );
        
        if (!simpleResult.success) {
            console.log('❌ Simple tool calling failed:');
            handleToolCallingError(simpleResult.error, targetModel.id, simplePayload);
            return false;
        }
        
        const simpleAnalysis = analyzeToolCallingPerformance(
            simpleResult.duration,
            targetModel.id,
            true
        );
        
        console.log(`✅ Simple tool calling: ${simpleAnalysis.message} (${simpleResult.duration}ms)`);
        
        const simpleResponse = await simpleResult.response.json();
        const simpleMessage = simpleResponse.choices?.[0]?.message;
        
        if (simpleMessage?.tool_calls && simpleMessage.tool_calls.length > 0) {
            console.log('✅ Tool calling successful - tool was invoked');
            const toolCall = simpleMessage.tool_calls[0];
            console.log(`   Function: ${toolCall.function.name}`);
            console.log(`   Arguments: ${toolCall.function.arguments}`);
        }
        
        console.log('\n✅ Optimized configuration validation complete!');
        return true;
        
    } catch (error) {
        console.log('❌ Optimization test failed:', error.message);
        return false;
    }
}

testOptimizedConfiguration().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Optimized Configuration Test ${success ? 'PASSED' : 'FAILED'}\n`);
    process.exit(success ? 0 : 1);
});