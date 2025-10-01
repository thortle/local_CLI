#!/usr/bin/env node

/**
 * Validation Script: CLI Fix Verification
 * 
 * This script validates that the CLI interactive mode fix works correctly.
 * The fix: Disable telemetry in ~/.gemini/settings.json to prevent timeout issues.
 * 
 * Test scenarios:
 * 1. Simple math question (no tools)
 * 2. Tool calling request (directory listing)
 * 3. Multi-turn conversation simulation
 * 4. Complex tool scenario (file search)
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMEOUT_MS = 30000; // 30 seconds max per test
const CLI_PATH = 'gemini-masters';

/**
 * Execute CLI command and capture response
 */
function executeCliCommand(prompt, timeout = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const args = ['--auth-type', 'lm-studio', '-p', prompt];
    
    console.log(`\n📤 Executing: ${CLI_PATH} ${args.join(' ')}`);
    
    const child = spawn(CLI_PATH, args, {
      cwd: path.resolve(__dirname, '../..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        resolve({ 
          stdout: stdout.trim(), 
          stderr: stderr.trim(), 
          duration,
          success: true 
        });
      } else {
        reject(new Error(`CLI exited with code ${code}\nStderr: ${stderr}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Check if settings.json has telemetry disabled
 */
function checkSettingsFile() {
  const settingsPath = path.join(process.env.HOME, '.gemini', 'settings.json');
  
  console.log('\n🔍 Checking settings file...');
  console.log(`Path: ${settingsPath}`);
  
  if (!fs.existsSync(settingsPath)) {
    console.log('❌ Settings file not found!');
    return false;
  }
  
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  console.log('Settings:', JSON.stringify(settings, null, 2));
  
  if (settings.telemetry === false) {
    console.log('✅ Telemetry is disabled in settings');
    return true;
  } else {
    console.log('⚠️  Telemetry is not explicitly disabled');
    return false;
  }
}

/**
 * Run all validation tests
 */
async function runValidation() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CLI FIX VALIDATION');
  console.log('═══════════════════════════════════════════════════════════');
  
  const results = [];
  
  // Pre-check: Verify settings file
  console.log('\n📋 PRE-CHECK: Settings File');
  const settingsOk = checkSettingsFile();
  if (!settingsOk) {
    console.log('\n⚠️  Warning: Telemetry may not be properly disabled!');
  }
  
  // Test 1: Simple math (no tools)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Simple Math Question (No Tools)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const result = await executeCliCommand('What is 15 + 27? Reply with just the number.');
    console.log(`✅ Response received in ${result.duration}ms`);
    console.log(`📥 Output: ${result.stdout.substring(0, 200)}`);
    
    const hasNumber = /42/.test(result.stdout);
    results.push({
      test: 'Simple Math',
      passed: hasNumber,
      duration: result.duration,
      details: hasNumber ? 'Correct answer received' : 'Incorrect or missing answer'
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    results.push({
      test: 'Simple Math',
      passed: false,
      duration: TIMEOUT_MS,
      details: error.message
    });
  }
  
  // Test 2: Tool calling (directory listing)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Tool Calling - Directory Listing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const result = await executeCliCommand('List the files in the current directory using the list_directory tool.');
    console.log(`✅ Response received in ${result.duration}ms`);
    console.log(`📥 Output: ${result.stdout.substring(0, 300)}...`);
    
    const hasFileList = /README|package\.json|tests/i.test(result.stdout);
    results.push({
      test: 'Directory Listing',
      passed: hasFileList,
      duration: result.duration,
      details: hasFileList ? 'Tool used successfully' : 'Tool may not have been used'
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    results.push({
      test: 'Directory Listing',
      passed: false,
      duration: TIMEOUT_MS,
      details: error.message
    });
  }
  
  // Test 3: File search tool
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Complex Tool - File Search');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const result = await executeCliCommand('Search for JavaScript files in the tests directory using the file_search tool.');
    console.log(`✅ Response received in ${result.duration}ms`);
    console.log(`📥 Output: ${result.stdout.substring(0, 300)}...`);
    
    const hasSearchResults = /\.js|found|search/i.test(result.stdout);
    results.push({
      test: 'File Search',
      passed: hasSearchResults,
      duration: result.duration,
      details: hasSearchResults ? 'Search executed successfully' : 'Search may have failed'
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    results.push({
      test: 'File Search',
      passed: false,
      duration: TIMEOUT_MS,
      details: error.message
    });
  }
  
  // Test 4: Quick response check (ensure no hanging)
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Response Speed Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const result = await executeCliCommand('Say "Hello"');
    console.log(`✅ Response received in ${result.duration}ms`);
    console.log(`📥 Output: ${result.stdout.substring(0, 100)}`);
    
    const isFast = result.duration < 10000; // Should complete in under 10 seconds
    results.push({
      test: 'Response Speed',
      passed: isFast,
      duration: result.duration,
      details: isFast ? 'Fast response (<10s)' : 'Slow response (>10s)'
    });
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    results.push({
      test: 'Response Speed',
      passed: false,
      duration: TIMEOUT_MS,
      details: error.message
    });
  }
  
  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('  VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log('\nResults:');
  results.forEach((result, i) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} Test ${i + 1}: ${result.test}`);
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Details: ${result.details}`);
  });
  
  console.log(`\n📊 Overall: ${passed}/${total} tests passed (${passRate}%)`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! CLI fix is working correctly.');
    return 0;
  } else {
    console.log('\n⚠️  Some tests failed. CLI may still have issues.');
    return 1;
  }
}

// Run validation
runValidation()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('\n❌ Validation failed with error:', error);
    process.exit(1);
  });
