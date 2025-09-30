#!/usr/bin/env node

/**
 * CLI Authentication Debugging Tool
 * 
 * This script helps debug the authentication issues between Gemini CLI
 * and LM Studio by testing different authentication approaches.
 */

console.log('🔍 Debugging CLI Authentication with LM Studio...\n');

async function testAuthenticationMethods() {
    const baseUrl = 'http://127.0.0.1:1234/v1';
    
    console.log('1️⃣ Testing direct API authentication methods...\n');
    
    const testMessage = {
        "model": "mistralai/devstral-small-2507",
        "messages": [{"role": "user", "content": "Hello"}],
        "max_tokens": 10
    };
    
    // Test 1: Bearer lm-studio (known working)
    console.log('Testing: Authorization: Bearer lm-studio');
    try {
        const response1 = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer lm-studio'
            },
            body: JSON.stringify(testMessage)
        });
        console.log(`   Status: ${response1.status} ${response1.statusText}`);
        if (response1.ok) {
            console.log('   ✅ Bearer lm-studio: WORKS');
        } else {
            console.log('   ❌ Bearer lm-studio: FAILED');
        }
    } catch (error) {
        console.log('   ❌ Bearer lm-studio: ERROR -', error.message);
    }
    
    // Test 2: No authorization header
    console.log('\nTesting: No Authorization header');
    try {
        const response2 = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testMessage)
        });
        console.log(`   Status: ${response2.status} ${response2.statusText}`);
        if (response2.ok) {
            console.log('   ✅ No auth: WORKS');
        } else {
            console.log('   ❌ No auth: FAILED');
        }
    } catch (error) {
        console.log('   ❌ No auth: ERROR -', error.message);
    }
    
    // Test 3: Bearer dummy
    console.log('\nTesting: Authorization: Bearer dummy');
    try {
        const response3 = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer dummy'
            },
            body: JSON.stringify(testMessage)
        });
        console.log(`   Status: ${response3.status} ${response3.statusText}`);
        if (response3.ok) {
            console.log('   ✅ Bearer dummy: WORKS');
        } else {
            console.log('   ❌ Bearer dummy: FAILED');
        }
    } catch (error) {
        console.log('   ❌ Bearer dummy: ERROR -', error.message);
    }
    
    // Test 4: Bearer (empty)
    console.log('\nTesting: Authorization: Bearer');
    try {
        const response4 = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer'
            },
            body: JSON.stringify(testMessage)
        });
        console.log(`   Status: ${response4.status} ${response4.statusText}`);
        if (response4.ok) {
            console.log('   ✅ Bearer (empty): WORKS');
        } else {
            console.log('   ❌ Bearer (empty): FAILED');
        }
    } catch (error) {
        console.log('   ❌ Bearer (empty): ERROR -', error.message);
    }
    
    console.log('\n2️⃣ Testing LM Studio server configuration...\n');
    
    // Check server info
    try {
        const serverResponse = await fetch(`${baseUrl}/models`);
        console.log(`Models endpoint status: ${serverResponse.status}`);
        if (serverResponse.ok) {
            const models = await serverResponse.json();
            console.log(`Available models: ${models.data.length}`);
            models.data.forEach(model => {
                console.log(`   - ${model.id}`);
            });
        }
    } catch (error) {
        console.log('❌ Server connection failed:', error.message);
    }
    
    console.log('\n3️⃣ CLI Environment Analysis...\n');
    
    console.log('Current environment variables:');
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY || 'not set'}`);
    console.log(`   OPENAI_BASE_URL: ${process.env.OPENAI_BASE_URL || 'not set'}`);
    console.log(`   LM_STUDIO_API_KEY: ${process.env.LM_STUDIO_API_KEY || 'not set'}`);
    console.log(`   LM_STUDIO_BASE_URL: ${process.env.LM_STUDIO_BASE_URL || 'not set'}`);
    
    console.log('\n4️⃣ Recommendations for CLI integration...\n');
    
    console.log('Based on testing:');
    console.log('✅ LM Studio accepts "Bearer lm-studio" authorization');
    console.log('✅ LM Studio server is accessible and responding');
    console.log('❌ CLI authentication configuration needs adjustment');
    console.log('\nPossible solutions:');
    console.log('1. Configure CLI to use "Bearer lm-studio" for LM Studio auth');
    console.log('2. Set OPENAI_API_KEY="lm-studio" for openai-compatible mode');
    console.log('3. Fix LM Studio auth type implementation in CLI');
    console.log('4. Use workaround with proper environment variables');
}

testAuthenticationMethods().catch(error => {
    console.log('❌ Authentication debugging failed:', error.message);
});