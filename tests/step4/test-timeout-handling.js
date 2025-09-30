#!/usr/bin/env node

/**
 * LM Studio Timeout and Error Handling Tests
 * 
 * Tests robust timeout handling and error scenarios
 * for tool calling with LM Studio integration.
 */

console.log('🧪 Testing LM Studio Timeout and Error Handling...\n');

async function testTimeoutHandling() {
    try {
        console.log('1️⃣ Setting up timeout testing environment...');
        
        const baseUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
        
        // Get available models
        let modelsResponse;
        try {
            modelsResponse = await fetch(`${baseUrl}/v1/models`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            console.log('❌ LM Studio connection failed:', error.message);
            return false;
        }
        
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.data || [];
        const targetModel = availableModels.find(m => 
            m.id.includes('devstral') || m.id.includes('mistral')
        ) || availableModels[0];
        
        console.log(`✅ Testing timeout handling with: ${targetModel.id}`);
        
        console.log('\n2️⃣ Testing progressive timeout values...');
        
        const timeouts = [5000, 10000, 15000, 30000]; // 5s, 10s, 15s, 30s
        const timeoutResults = [];
        
        const testTool = {
            "type": "function",
            "function": {
                "name": "process_complex_data",
                "description": "Process complex data that might take time",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "data": {
                            "type": "string",
                            "description": "Data to process"
                        },
                        "complexity": {
                            "type": "string",
                            "enum": ["simple", "medium", "complex"],
                            "description": "Processing complexity"
                        }
                    },
                    "required": ["data", "complexity"]
                }
            }
        };
        
        const complexPrompt = "Please process the following complex dataset using the process_complex_data tool with complexity set to 'complex': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'";
        
        for (const timeout of timeouts) {
            console.log(`   ⏱️  Testing ${timeout/1000}s timeout...`);
            
            const payload = {
                "model": targetModel.id,
                "messages": [{"role": "user", "content": complexPrompt}],
                "tools": [testTool],
                "tool_choice": "auto",
                "temperature": 0.3,
                "max_tokens": 200,
                "stream": false
            };
            
            const startTime = Date.now();
            
            try {
                const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer lm-studio'
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(timeout)
                });
                
                const responseTime = Date.now() - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    const message = data.choices?.[0]?.message;
                    const toolCalled = message?.tool_calls && message.tool_calls.length > 0;
                    
                    timeoutResults.push({
                        timeout: timeout/1000,
                        responseTime,
                        success: true,
                        toolCalled,
                        finishReason: data.choices?.[0]?.finish_reason
                    });
                    
                    console.log(`      ✅ Completed in ${responseTime}ms - ${toolCalled ? 'Tool called' : 'No tool call'}`);
                    
                    // If we get a successful response within this timeout, we can break
                    // as longer timeouts will likely also succeed
                    if (toolCalled) {
                        console.log(`      🎯 Found working timeout: ${timeout/1000}s`);
                        break;
                    }
                } else {
                    timeoutResults.push({
                        timeout: timeout/1000,
                        responseTime,
                        success: false,
                        error: `HTTP ${response.status}`
                    });
                    console.log(`      ❌ HTTP error: ${response.status}`);
                }
            } catch (error) {
                const responseTime = Date.now() - startTime;
                const isTimeout = error.name === 'AbortError';
                
                timeoutResults.push({
                    timeout: timeout/1000,
                    responseTime,
                    success: false,
                    isTimeout,
                    error: error.message
                });
                
                if (isTimeout) {
                    console.log(`      ⏰ Timeout after ${timeout/1000}s`);
                } else {
                    console.log(`      ❌ Error: ${error.message}`);
                }
            }
        }
        
        console.log('\n3️⃣ Testing error scenario handling...');
        
        // Test with invalid tool format
        console.log('   🔍 Testing invalid tool format...');
        const invalidToolPayload = {
            "model": targetModel.id,
            "messages": [{"role": "user", "content": "Use the invalid tool"}],
            "tools": [{"invalid": "tool format"}], // Invalid format
            "tool_choice": "auto",
            "temperature": 0.3,
            "max_tokens": 150,
            "stream": false
        };
        
        try {
            const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(invalidToolPayload),
                signal: AbortSignal.timeout(10000)
            });
            
            if (response.ok) {
                console.log('      ⚠️  LM Studio accepted invalid tool format');
            } else {
                console.log(`      ✅ LM Studio properly rejected invalid tool format: ${response.status}`);
            }
        } catch (error) {
            console.log(`      ✅ Error properly caught: ${error.message}`);
        }
        
        // Test with model unavailable scenario (using invalid model)
        console.log('   🔍 Testing model unavailable scenario...');
        const invalidModelPayload = {
            "model": "non-existent-model",
            "messages": [{"role": "user", "content": "Test message"}],
            "tools": [testTool],
            "tool_choice": "auto",
            "temperature": 0.3,
            "max_tokens": 150,
            "stream": false
        };
        
        try {
            const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(invalidModelPayload),
                signal: AbortSignal.timeout(10000)
            });
            
            if (response.ok) {
                console.log('      ⚠️  LM Studio accepted invalid model');
            } else {
                console.log(`      ✅ LM Studio properly rejected invalid model: ${response.status}`);
            }
        } catch (error) {
            console.log(`      ✅ Error properly caught: ${error.message}`);
        }
        
        // Test connection interruption (invalid URL)
        console.log('   🔍 Testing connection interruption...');
        try {
            const response = await fetch('http://127.0.0.1:9999/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(invalidModelPayload),
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            console.log(`      ✅ Connection error properly handled: ${error.message}`);
        }
        
        console.log('\n4️⃣ Analyzing timeout and error handling results...');
        
        // Analyze timeout results
        const successfulTimeouts = timeoutResults.filter(r => r.success && r.toolCalled);
        const timedOutTests = timeoutResults.filter(r => r.isTimeout);
        
        console.log('📊 Timeout Analysis:');
        console.log(`   ✅ Successful tool calls: ${successfulTimeouts.length}/${timeoutResults.length}`);
        console.log(`   ⏰ Timed out requests: ${timedOutTests.length}/${timeoutResults.length}`);
        
        if (successfulTimeouts.length > 0) {
            const fastestSuccess = successfulTimeouts.reduce((fastest, current) => 
                current.responseTime < fastest.responseTime ? current : fastest
            );
            console.log(`   🏆 Fastest successful response: ${fastestSuccess.responseTime}ms (${fastestSuccess.timeout}s timeout)`);
            
            const recommendedTimeout = Math.max(fastestSuccess.responseTime * 2, 15000); // At least 15s, or 2x fastest response
            console.log(`   💡 Recommended timeout: ${recommendedTimeout/1000}s`);
        }
        
        if (timedOutTests.length === timeoutResults.length) {
            console.log('🚨 CRITICAL: All timeout tests failed - potential stalling issue detected');
            console.log('📋 Recommendations:');
            console.log('   1. Check LM Studio model compatibility with tool calling');
            console.log('   2. Verify model is not overloaded or stuck');
            console.log('   3. Test with simpler tool definitions');
            console.log('   4. Check LM Studio logs for errors');
        } else if (timedOutTests.length > 0) {
            console.log('⚠️  Some timeout issues detected - optimization needed');
            console.log('📋 Recommendations:');
            console.log('   1. Use longer timeouts for complex tool calling');
            console.log('   2. Implement progressive timeout strategy');
            console.log('   3. Add timeout warning messages to users');
        } else {
            console.log('✅ Timeout handling working correctly');
        }
        
        // Provide implementation recommendations
        console.log('\n💡 Implementation Recommendations:');
        
        if (successfulTimeouts.length > 0) {
            const optimalTimeout = successfulTimeouts[0].timeout * 1000;
            console.log(`1. Set default timeout to ${optimalTimeout/1000}s for tool calling requests`);
            console.log('2. Implement progressive timeout (warn at 50%, fail at 100%)');
            console.log('3. Add user-friendly timeout messages');
            console.log('4. Implement retry logic for timeout scenarios');
        } else {
            console.log('1. URGENT: Investigate fundamental tool calling issues');
            console.log('2. Implement maximum timeout of 30-60 seconds');
            console.log('3. Add clear error messages for timeout scenarios');
            console.log('4. Consider fallback strategies when tool calling fails');
        }
        
        console.log('5. Add connection health checks before tool calling');
        console.log('6. Implement graceful degradation for error scenarios');
        console.log('7. Log timeout patterns for further analysis');
        
        return successfulTimeouts.length > 0;
        
    } catch (error) {
        console.log('❌ Timeout handling test failed:', error.message);
        return false;
    }
}

// Run the test
testTimeoutHandling().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Timeout Handling Test ${success ? 'COMPLETED' : 'FAILED'}\n`);
    process.exit(success ? 0 : 1);
});