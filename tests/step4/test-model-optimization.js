#!/usr/bin/env node

/**
 * LM Studio Model Optimization Tests
 * 
 * Tests various parameter configurations with mistralai/devstral-small-2507
 * to find optimal settings for tool calling performance.
 */

console.log('🧪 Testing LM Studio Model Optimization for Tool Calling...\n');

async function testModelOptimization() {
    try {
        console.log('1️⃣ Setting up optimization test environment...');
        
        const baseUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
        
        // Verify LM Studio connection and target model
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
        
        if (!modelsResponse.ok) {
            console.log('❌ LM Studio API error:', modelsResponse.status);
            return false;
        }
        
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.data || [];
        
        // Find the target model
        const targetModel = availableModels.find(m => 
            m.id.includes('devstral') || m.id.includes('mistral')
        ) || availableModels[0];
        
        if (!targetModel) {
            console.log('❌ No models available in LM Studio');
            return false;
        }
        
        console.log(`✅ Testing with model: ${targetModel.id}`);
        
        // Define test tool for consistent testing
        const testTool = {
            "type": "function",
            "function": {
                "name": "analyze_numbers",
                "description": "Analyze a list of numbers and return statistics",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "numbers": {
                            "type": "array",
                            "items": {"type": "number"},
                            "description": "Array of numbers to analyze"
                        },
                        "operation": {
                            "type": "string",
                            "enum": ["sum", "average", "max", "min"],
                            "description": "Type of analysis to perform"
                        }
                    },
                    "required": ["numbers", "operation"]
                }
            }
        };
        
        const testPrompt = "Please analyze the numbers [1, 5, 3, 9, 2] and calculate their sum using the analyze_numbers tool.";
        
        console.log('\n2️⃣ Testing temperature optimization...');
        
        const temperatures = [0.1, 0.3, 0.5, 0.7];
        const temperatureResults = [];
        
        for (const temp of temperatures) {
            console.log(`   🌡️  Testing temperature: ${temp}`);
            
            const payload = {
                "model": targetModel.id,
                "messages": [{"role": "user", "content": testPrompt}],
                "tools": [testTool],
                "tool_choice": "auto",
                "temperature": temp,
                "max_tokens": 150,
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
                    signal: AbortSignal.timeout(20000)
                });
                
                const responseTime = Date.now() - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    const message = data.choices?.[0]?.message;
                    const toolCalled = message?.tool_calls && message.tool_calls.length > 0;
                    
                    temperatureResults.push({
                        temperature: temp,
                        responseTime,
                        toolCalled,
                        finishReason: data.choices?.[0]?.finish_reason,
                        success: true
                    });
                    
                    console.log(`      ⏱️  ${responseTime}ms - ${toolCalled ? '✅ Tool called' : '❌ No tool call'}`);
                } else {
                    temperatureResults.push({
                        temperature: temp,
                        responseTime,
                        success: false,
                        error: `HTTP ${response.status}`
                    });
                    console.log(`      ❌ Failed: HTTP ${response.status}`);
                }
            } catch (error) {
                const responseTime = Date.now() - startTime;
                temperatureResults.push({
                    temperature: temp,
                    responseTime,
                    success: false,
                    error: error.message
                });
                console.log(`      ❌ Error after ${responseTime}ms: ${error.message}`);
            }
        }
        
        console.log('\n3️⃣ Testing max_tokens optimization...');
        
        const maxTokenSettings = [50, 100, 150, 300];
        const tokenResults = [];
        
        for (const maxTokens of maxTokenSettings) {
            console.log(`   🎯 Testing max_tokens: ${maxTokens}`);
            
            const payload = {
                "model": targetModel.id,
                "messages": [{"role": "user", "content": testPrompt}],
                "tools": [testTool],
                "tool_choice": "auto",
                "temperature": 0.3, // Use optimal temperature from previous test
                "max_tokens": maxTokens,
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
                    signal: AbortSignal.timeout(20000)
                });
                
                const responseTime = Date.now() - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    const message = data.choices?.[0]?.message;
                    const toolCalled = message?.tool_calls && message.tool_calls.length > 0;
                    
                    tokenResults.push({
                        maxTokens,
                        responseTime,
                        toolCalled,
                        finishReason: data.choices?.[0]?.finish_reason,
                        success: true
                    });
                    
                    console.log(`      ⏱️  ${responseTime}ms - ${toolCalled ? '✅ Tool called' : '❌ No tool call'}`);
                } else {
                    tokenResults.push({
                        maxTokens,
                        responseTime,
                        success: false,
                        error: `HTTP ${response.status}`
                    });
                    console.log(`      ❌ Failed: HTTP ${response.status}`);
                }
            } catch (error) {
                const responseTime = Date.now() - startTime;
                tokenResults.push({
                    maxTokens,
                    responseTime,
                    success: false,
                    error: error.message
                });
                console.log(`      ❌ Error after ${responseTime}ms: ${error.message}`);
            }
        }
        
        console.log('\n4️⃣ Testing tool_choice optimization...');
        
        const toolChoices = ["auto", "required"];
        const toolChoiceResults = [];
        
        for (const toolChoice of toolChoices) {
            console.log(`   🔧 Testing tool_choice: ${toolChoice}`);
            
            const payload = {
                "model": targetModel.id,
                "messages": [{"role": "user", "content": testPrompt}],
                "tools": [testTool],
                "tool_choice": toolChoice,
                "temperature": 0.3,
                "max_tokens": 150,
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
                    signal: AbortSignal.timeout(20000)
                });
                
                const responseTime = Date.now() - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    const message = data.choices?.[0]?.message;
                    const toolCalled = message?.tool_calls && message.tool_calls.length > 0;
                    
                    toolChoiceResults.push({
                        toolChoice,
                        responseTime,
                        toolCalled,
                        finishReason: data.choices?.[0]?.finish_reason,
                        success: true
                    });
                    
                    console.log(`      ⏱️  ${responseTime}ms - ${toolCalled ? '✅ Tool called' : '❌ No tool call'}`);
                } else {
                    toolChoiceResults.push({
                        toolChoice,
                        responseTime,
                        success: false,
                        error: `HTTP ${response.status}`
                    });
                    console.log(`      ❌ Failed: HTTP ${response.status}`);
                }
            } catch (error) {
                const responseTime = Date.now() - startTime;
                toolChoiceResults.push({
                    toolChoice,
                    responseTime,
                    success: false,
                    error: error.message
                });
                console.log(`      ❌ Error after ${responseTime}ms: ${error.message}`);
            }
        }
        
        console.log('\n📊 Optimization Results Analysis...');
        
        // Analyze temperature results
        const successfulTempTests = temperatureResults.filter(r => r.success && r.toolCalled);
        if (successfulTempTests.length > 0) {
            const optimalTemp = successfulTempTests.reduce((best, current) => 
                current.responseTime < best.responseTime ? current : best
            );
            console.log(`🌡️  Optimal temperature: ${optimalTemp.temperature} (${optimalTemp.responseTime}ms)`);
        } else {
            console.log('❌ No successful temperature tests');
        }
        
        // Analyze token results
        const successfulTokenTests = tokenResults.filter(r => r.success && r.toolCalled);
        if (successfulTokenTests.length > 0) {
            const optimalTokens = successfulTokenTests.reduce((best, current) => 
                current.responseTime < best.responseTime ? current : best
            );
            console.log(`🎯 Optimal max_tokens: ${optimalTokens.maxTokens} (${optimalTokens.responseTime}ms)`);
        } else {
            console.log('❌ No successful token tests');
        }
        
        // Analyze tool choice results
        const successfulChoiceTests = toolChoiceResults.filter(r => r.success && r.toolCalled);
        if (successfulChoiceTests.length > 0) {
            const optimalChoice = successfulChoiceTests.reduce((best, current) => 
                current.responseTime < best.responseTime ? current : best
            );
            console.log(`🔧 Optimal tool_choice: ${optimalChoice.toolChoice} (${optimalChoice.responseTime}ms)`);
        } else {
            console.log('❌ No successful tool choice tests');
        }
        
        // Generate optimization recommendations
        console.log('\n📋 Optimization Recommendations:');
        
        const totalSuccessful = successfulTempTests.length + successfulTokenTests.length + successfulChoiceTests.length;
        
        if (totalSuccessful > 0) {
            console.log('✅ Tool calling optimization successful!');
            
            const bestTemp = successfulTempTests.length > 0 ? 
                successfulTempTests.reduce((best, current) => 
                    current.responseTime < best.responseTime ? current : best
                ).temperature : 0.3;
                
            const bestTokens = successfulTokenTests.length > 0 ? 
                successfulTokenTests.reduce((best, current) => 
                    current.responseTime < best.responseTime ? current : best
                ).maxTokens : 150;
                
            const bestChoice = successfulChoiceTests.length > 0 ? 
                successfulChoiceTests.reduce((best, current) => 
                    current.responseTime < best.responseTime ? current : best
                ).toolChoice : "auto";
            
            console.log(`\n🎯 Recommended Configuration for ${targetModel.id}:`);
            console.log(`   temperature: ${bestTemp}`);
            console.log(`   max_tokens: ${bestTokens}`);
            console.log(`   tool_choice: "${bestChoice}"`);
            
        } else {
            console.log('❌ Tool calling optimization failed - no successful tests');
            console.log('🔍 This suggests fundamental issues with tool calling support');
        }
        
        return totalSuccessful > 0;
        
    } catch (error) {
        console.log('❌ Model optimization test failed:', error.message);
        return false;
    }
}

// Run the test
testModelOptimization().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Model Optimization ${success ? 'COMPLETED' : 'FAILED'}\n`);
    process.exit(success ? 0 : 1);
});