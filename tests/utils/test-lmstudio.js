#!/usr/bin/env node

// Test script to verify LM Studio integration
console.log('🧪 Testing LM Studio CLI Integration...\n');

async function testLMStudioIntegration() {
  try {
    // Import the functions we need to test
    const bundlePath = './gemini-cli-masters/bundle/gemini.js';
    
    // Test 1: Check if bundle contains LM Studio support
    const fs = require('fs');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    const checks = [
      { name: 'AuthType.USE_LM_STUDIO enum', test: bundleContent.includes('USE_LM_STUDIO') },
      { name: '/model command help includes lmstudio', test: bundleContent.includes('Usage: /model [local|claude|openai|lmstudio]') },
      { name: 'LM Studio in auth method selection', test: bundleContent.includes('{ label: "LM Studio", value: AuthType2.USE_LM_STUDIO }') },
      { name: 'LM Studio case in createCustomContentGenerator', test: bundleContent.includes('case "lm-studio":') },
      { name: 'LM Studio configuration in createContentGeneratorConfig', test: bundleContent.includes('AuthType2.USE_LM_STUDIO') && bundleContent.includes('http://127.0.0.1:1234/v1') },
      { name: 'CLI auth-type choices include lm-studio', test: bundleContent.includes('"lm-studio"') && bundleContent.includes('choices:') }
    ];
    
    console.log('📋 Integration Checks:');
    let allPassed = true;
    
    checks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`   ${status} ${check.name}`);
      if (!check.test) allPassed = false;
    });
    
    // Test 2: Check environment variables
    console.log('\n🔧 Environment Configuration:');
    const lmStudioUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234/v1';
    const lmStudioModel = process.env.LM_STUDIO_MODEL || 'mistralai/devstral-small-2507';
    
    console.log(`   📡 Base URL: ${lmStudioUrl}`);
    console.log(`   🤖 Default Model: ${lmStudioModel}`);
    
    // Test 3: Test connection to LM Studio (if available)
    console.log('\n🌐 LM Studio Connection Test:');
    try {
      const fetch = await import('node-fetch').then(m => m.default);
      const response = await fetch(`${lmStudioUrl.replace('/v1', '')}/v1/models`, {
        method: 'GET',
        timeout: 3000
      });
      
      if (response.ok) {
        const models = await response.json();
        console.log(`   ✅ LM Studio is running and accessible`);
        console.log(`   📋 Available models: ${models.data?.length || 0}`);
        if (models.data?.length > 0) {
          console.log(`   🎯 First model: ${models.data[0].id}`);
        }
      } else {
        console.log(`   ⚠️  LM Studio responding but with error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ LM Studio not available: ${error.message}`);
      console.log(`   💡 Make sure LM Studio is running on ${lmStudioUrl.replace('/v1', '')}`);
    }
    
    console.log('\n🎉 Integration Summary:');
    if (allPassed) {
      console.log('   ✅ All integration checks passed!');
      console.log('   🚀 LM Studio integration is ready to use');
      console.log('\n📖 Usage Instructions:');
      console.log('   1. Start LM Studio and load a model');
      console.log('   2. Run: cd /Users/thortle/Desktop/ML/CLI/gemini-cli-masters && node bundle/gemini.js');
      console.log('   3. Select "LM Studio" from auth method dialog');
      console.log('   4. Use "/model lmstudio" to switch to LM Studio');
      console.log('   5. Start chatting with your local model!');
    } else {
      console.log('   ❌ Some integration checks failed');
      console.log('   🔧 Please review the failed checks above');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLMStudioIntegration();