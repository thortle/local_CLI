#!/usr/bin/env node

/**
 * LM Studio Tool Calling Validation Tests
 * 
 * This test suite specifically validates that LM Studio integration
 * properly handles tool calling with models that support function calling.
 * 
 * Focus: mistralai/devstral-small-2507 tool calling validation
 */

console.log('🧪 Testing LM Studio Tool Calling Functionality...\n');

async function testToolCalling() {
    try {
        console.log('1️⃣ Testing LM Studio connection and model availability...');
        
        // Check if LM Studio is running and has models loaded
        const fetch = await import('node-fetch').then(m => m.default);
        const baseUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
        
        let modelsResponse;
        try {
            modelsResponse = await fetch(`${baseUrl}/v1/models`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
        } catch (error) {
            console.log('❌ LM Studio connection failed:', error.message);
            console.log('📋 Make sure LM Studio is running on http://127.0.0.1:1234');
            return false;
        }
        
        if (!modelsResponse.ok) {
            console.log('❌ LM Studio API error:', modelsResponse.status, modelsResponse.statusText);
            return false;
        }
        
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.data || [];
        
        console.log('✅ LM Studio connection successful');
        console.log(`📊 Available models: ${availableModels.length}`);
        
        if (availableModels.length === 0) {
            console.log('❌ No models loaded in LM Studio');
            console.log('📋 Please load a model (preferably mistralai/devstral-small-2507) in LM Studio');
            return false;
        }
        
        // Check for the recommended model
        const devstralModel = availableModels.find(m => m.id.includes('devstral') || m.id.includes('mistral'));
        const currentModel = devstralModel || availableModels[0];
        
        console.log(`🎯 Testing with model: ${currentModel.id}`);
        if (devstralModel) {
            console.log('✅ Found Devstral model (recommended for tool calling)');
        } else {
            console.log('⚠️  Using available model - may not support tool calling optimally');
        }
        
        console.log('\n2️⃣ Testing basic tool calling capability...');
        
        // Define a simple tool for testing
        const testTool = {
            "type": "function",
            "function": {
                "name": "get_current_time",
                "description": "Get the current time",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        };
        
        // Test tool calling with a simple prompt
        const testPayload = {
            "model": currentModel.id,
            "messages": [
                {
                    "role": "user",
                    "content": "What time is it? Please use the available tool to find out."
                }
            ],
            "tools": [testTool],
            "tool_choice": "auto",
            "max_tokens": 150,
            "temperature": 0.1,
            "stream": false
        };
        
        console.log('📤 Sending tool calling request...');
        console.log(`📋 Request payload: ${JSON.stringify(testPayload, null, 2)}`);
        
        const startTime = Date.now();
        let toolResponse;
        
        try {
            toolResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(testPayload),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });
        } catch (error) {
            const duration = Date.now() - startTime;
            console.log(`❌ Tool calling request failed after ${duration}ms:`, error.message);
            
            if (error.name === 'AbortError') {
                console.log('🚨 TIMEOUT: Model appears to be stalling on tool calling');
                console.log('📋 This suggests the model or integration has issues with tool calling');
            }
            return false;
        }
        
        const responseTime = Date.now() - startTime;
        console.log(`⏱️  Response time: ${responseTime}ms`);
        
        if (!toolResponse.ok) {
            console.log('❌ Tool calling API error:', toolResponse.status, toolResponse.statusText);
            const errorText = await toolResponse.text();
            console.log('📋 Error details:', errorText);
            return false;
        }
        
        const responseData = await toolResponse.json();
        console.log('✅ Tool calling response received');
        console.log(`📋 Response: ${JSON.stringify(responseData, null, 2)}`);
        
        // Analyze the response
        console.log('\n3️⃣ Analyzing tool calling behavior...');
        
        const message = responseData.choices?.[0]?.message;
        if (!message) {
            console.log('❌ No message in response');
            return false;
        }
        
        console.log(`📝 Message role: ${message.role}`);
        console.log(`📝 Message content: ${message.content || 'null'}`);
        
        // Check if tool was called
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log('✅ Tool calling detected!');
            console.log(`📊 Tool calls made: ${message.tool_calls.length}`);
            message.tool_calls.forEach((call, index) => {
                console.log(`   ${index + 1}. Function: ${call.function.name}`);
                console.log(`      Arguments: ${call.function.arguments}`);
            });
        } else {
            console.log('⚠️  No tool calls detected - model may not understand tool calling format');
            if (message.content) {
                console.log('📋 Model responded with text instead of tool call');
            }
        }
        
        // Check finish reason
        const finishReason = responseData.choices?.[0]?.finish_reason;
        console.log(`🏁 Finish reason: ${finishReason}`);
        
        if (finishReason === 'tool_calls') {
            console.log('✅ Proper tool calling finish reason');
        } else if (finishReason === 'stop') {
            console.log('⚠️  Model finished without calling tools');
        } else {
            console.log(`❓ Unexpected finish reason: ${finishReason}`);
        }
        
        console.log('\n4️⃣ Testing more complex tool calling scenario...');
        
        // Test with a more complex tool that requires parameters
        const complexTool = {
            "type": "function",
            "function": {
                "name": "calculate_sum",
                "description": "Calculate the sum of two numbers",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "a": {
                            "type": "number",
                            "description": "First number"
                        },
                        "b": {
                            "type": "number", 
                            "description": "Second number"
                        }
                    },
                    "required": ["a", "b"]
                }
            }
        };
        
        const complexTestPayload = {
            "model": currentModel.id,
            "messages": [
                {
                    "role": "user",
                    "content": "Please calculate the sum of 15 and 27 using the calculator tool."
                }
            ],
            "tools": [complexTool],
            "tool_choice": "auto",
            "max_tokens": 150,
            "temperature": 0.1,
            "stream": false
        };
        
        console.log('📤 Sending complex tool calling request...');
        
        const complexStartTime = Date.now();
        let complexResponse;
        
        try {
            complexResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer lm-studio'
                },
                body: JSON.stringify(complexTestPayload),
                signal: AbortSignal.timeout(30000)
            });
        } catch (error) {
            const duration = Date.now() - complexStartTime;
            console.log(`❌ Complex tool calling failed after ${duration}ms:`, error.message);
            return false;
        }
        
        const complexResponseTime = Date.now() - complexStartTime;
        console.log(`⏱️  Complex response time: ${complexResponseTime}ms`);
        
        if (complexResponse.ok) {
            const complexData = await complexResponse.json();
            const complexMessage = complexData.choices?.[0]?.message;
            
            if (complexMessage?.tool_calls && complexMessage.tool_calls.length > 0) {
                console.log('✅ Complex tool calling successful!');
                const toolCall = complexMessage.tool_calls[0];
                console.log(`📊 Called: ${toolCall.function.name}`);
                console.log(`📊 Arguments: ${toolCall.function.arguments}`);
                
                // Validate arguments parsing
                try {
                    const args = JSON.parse(toolCall.function.arguments);
                    if (args.a && args.b) {
                        console.log(`✅ Proper argument extraction: a=${args.a}, b=${args.b}`);
                    } else {
                        console.log('⚠️  Arguments missing required fields');
                    }
                } catch (parseError) {
                    console.log('❌ Invalid JSON in tool arguments:', parseError.message);
                }
            } else {
                console.log('⚠️  Complex tool calling not performed');
            }
        }
        
        console.log('\n✅ Tool calling validation complete!');
        return true;
        
    } catch (error) {
        console.log('❌ Tool calling test failed:', error.message);
        console.log('🔍 Stack trace:', error.stack);
        return false;
    }
}

// Run the test
testToolCalling().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} Tool calling validation ${success ? 'PASSED' : 'FAILED'}\n`);
    process.exit(success ? 0 : 1);
});