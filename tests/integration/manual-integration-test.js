#!/usr/bin/env node

console.log('🧪 Manual End-to-End LM Studio Integration Test\n');

async function testIntegration() {
    console.log('1️⃣ Testing CLI integration...');
    
    // Test 1: Check LM Studio in help
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
        const { stdout } = await execAsync('gemini-masters --help');
        if (stdout.includes('lm-studio')) {
            console.log('✅ LM Studio appears in CLI help');
        } else {
            console.log('❌ LM Studio missing from CLI help');
            return false;
        }
    } catch (error) {
        console.log('❌ CLI help test failed:', error.message);
        return false;
    }
    
    // Test 2: Check global installation
    console.log('2️⃣ Testing global installation...');
    try {
        const { stdout } = await execAsync('which gemini-masters');
        console.log('✅ Global installation found:', stdout.trim());
    } catch (error) {
        console.log('❌ Global installation test failed');
        return false;
    }
    
    // Test 3: Check bundle modification
    console.log('3️⃣ Testing bundle modification...');
    const fs = require('fs');
    const bundlePath = '/Users/thortle/Desktop/ML/CLI/gemini-cli-masters/bundle/gemini.js';
    
    if (fs.existsSync(bundlePath)) {
        const bundleContent = fs.readFileSync(bundlePath, 'utf8');
        if (bundleContent.includes('USE_LM_STUDIO')) {
            console.log('✅ Bundle contains LM Studio modifications');
        } else {
            console.log('❌ Bundle missing LM Studio modifications');
            return false;
        }
        
        if (bundleContent.includes('case "lm-studio":')) {
            console.log('✅ Bundle contains LM Studio case handler');
        } else {
            console.log('❌ Bundle missing LM Studio case handler');
            return false;
        }
        
        if (bundleContent.includes('key.return')) {
            console.log('✅ Bundle contains Enter key fix');
        } else {
            console.log('❌ Bundle missing Enter key fix');
            return false;
        }
    } else {
        console.log('❌ Bundle file not found');
        return false;
    }
    
    // Test 4: Test helper connection
    console.log('4️⃣ Testing LM Studio connection...');
    try {
        const { stdout } = await execAsync('cd /Users/thortle/Desktop/ML/CLI/tests/utils && node test-helpers.js --check-lmstudio');
        if (stdout.includes('LM Studio is available')) {
            console.log('✅ LM Studio connection verified');
        } else {
            console.log('❌ LM Studio connection failed');
            return false;
        }
    } catch (error) {
        console.log('❌ LM Studio connection test failed:', error.message);
        return false;
    }
    
    console.log('\n🎉 All integration tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ CLI Integration - LM Studio commands available');
    console.log('✅ Bundle Modification - All modifications present');
    console.log('✅ Authentication Fix - Enter key handler added');
    console.log('✅ Global Installation - Working correctly');
    console.log('✅ Connection - LM Studio available and responding');
    
    return true;
}

testIntegration().then(success => {
    process.exit(success ? 0 : 1);
});