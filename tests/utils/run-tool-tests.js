#!/usr/bin/env node

/**
 * LM Studio Tool Calling Test Runner
 * 
 * Executes comprehensive tool calling validation tests
 * in logical sequence to diagnose and validate LM Studio
 * integration with tool-enabled models.
 */

import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('🧪 LM Studio Tool Calling Test Suite\n');
console.log('=' .repeat(50));

class ToolCallingTestRunner {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    async runTest(testName, testPath, description) {
        console.log(`\n🔬 Running: ${testName}`);
        console.log(`📋 ${description}`);
        console.log('-'.repeat(40));
        
        const testStart = Date.now();
        
        try {
            if (!existsSync(testPath)) {
                throw new Error(`Test file not found: ${testPath}`);
            }

            // Run the test
            const result = execSync(`node "${testPath}"`, {
                cwd: process.cwd(),
                encoding: 'utf8',
                timeout: 90000, // 90 second timeout per test
                env: {
                    ...process.env,
                    LM_STUDIO_BASE_URL: 'http://127.0.0.1:1234/v1',
                    LM_STUDIO_MODEL: 'mistralai/devstral-small-2507'
                }
            });
            
            const duration = Date.now() - testStart;
            const success = !result.includes('FAILED') && !result.includes('❌');
            
            this.testResults.push({
                name: testName,
                success,
                duration,
                output: result
            });
            
            console.log(`⏱️  Duration: ${duration}ms`);
            console.log(`${success ? '✅' : '❌'} ${testName}: ${success ? 'PASSED' : 'FAILED'}`);
            
            return success;
            
        } catch (error) {
            const duration = Date.now() - testStart;
            
            this.testResults.push({
                name: testName,
                success: false,
                duration,
                error: error.message,
                output: error.stdout || ''
            });
            
            console.log(`⏱️  Duration: ${duration}ms`);
            console.log(`❌ ${testName}: FAILED`);
            console.log(`🔴 Error: ${error.message}`);
            
            if (error.stdout) {
                console.log('📤 Output:', error.stdout.substring(0, 500));
            }
            
            return false;
        }
    }

    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...\n');
        
        const checks = [
            {
                name: 'Node.js version',
                test: () => {
                    const version = process.version;
                    const major = parseInt(version.slice(1).split('.')[0]);
                    return major >= 20;
                },
                error: 'Node.js version 20+ required'
            },
            {
                name: 'LM Studio connection',
                test: async () => {
                    try {
                        const fetch = await import('node-fetch').then(m => m.default);
                        const response = await fetch('http://127.0.0.1:1234/v1/models', {
                            signal: AbortSignal.timeout(5000)
                        });
                        return response.ok;
                    } catch {
                        return false;
                    }
                },
                error: 'LM Studio not running or not accessible on port 1234'
            },
            {
                name: 'gemini-masters CLI',
                test: () => {
                    try {
                        execSync('which gemini-masters', { stdio: 'pipe' });
                        return true;
                    } catch {
                        return false;
                    }
                },
                error: 'gemini-masters CLI not installed globally'
            },
            {
                name: 'Test directory access',
                test: () => {
                    try {
                        execSync('mkdir -p /tmp/gemini-test && rmdir /tmp/gemini-test', { stdio: 'pipe' });
                        return true;
                    } catch {
                        return false;
                    }
                },
                error: 'Cannot create test directories in /tmp'
            }
        ];
        
        let allPassed = true;
        
        for (const check of checks) {
            try {
                const result = await check.test();
                console.log(`${result ? '✅' : '❌'} ${check.name}`);
                if (!result) {
                    console.log(`   🔴 ${check.error}`);
                    allPassed = false;
                }
            } catch (error) {
                console.log(`❌ ${check.name}`);
                console.log(`   🔴 ${check.error}: ${error.message}`);
                allPassed = false;
            }
        }
        
        if (!allPassed) {
            console.log('\n❌ Prerequisites not met. Please fix the issues above before running tests.');
            return false;
        }
        
        console.log('\n✅ All prerequisites met!');
        return true;
    }

    async runAllTests() {
        console.log('\n🚀 Running Tool Calling Test Suite...\n');
        
        const tests = [
            {
                name: 'LM Studio Connection Test',
                path: '../step1/test-connection.js',
                description: 'Validates LM Studio connection and model discovery'
            },
            {
                name: 'API Tool Calling Test',
                path: '../step4/test-api-tool-calling.js',
                description: 'Tests direct API tool calling to LM Studio'
            },
            {
                name: 'Model Optimization Test',
                path: '../step4/test-model-optimization.js',
                description: 'Tests optimal parameters for tool calling performance'
            },
            {
                name: 'Timeout Handling Test',
                path: '../step4/test-timeout-handling.js',
                description: 'Tests timeout and error handling robustness'
            },
            {
                name: 'CLI Tool Integration Test',
                path: '../step4/test-cli-tool-integration.js',
                description: 'Tests tool calling through Gemini CLI interface'
            }
        ];
        
        let passedTests = 0;
        
        for (const test of tests) {
            const success = await this.runTest(test.name, test.path, test.description);
            if (success) passedTests++;
        }
        
        return { total: tests.length, passed: passedTests };
    }

    printSummary(results) {
        const totalDuration = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUITE SUMMARY');
        console.log('='.repeat(50));
        
        console.log(`⏱️  Total Duration: ${totalDuration}ms`);
        console.log(`📈 Tests Passed: ${results.passed}/${results.total}`);
        console.log(`📊 Success Rate: ${(results.passed / results.total * 100).toFixed(1)}%`);
        
        console.log('\n📋 Individual Test Results:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅ PASS' : '❌ FAIL';
            console.log(`   ${index + 1}. ${result.name}: ${status} (${result.duration}ms)`);
            if (result.error) {
                console.log(`      🔴 ${result.error}`);
            }
        });
        
        // Provide specific guidance based on results
        console.log('\n🔍 ANALYSIS:');
        
        if (results.passed === results.total) {
            console.log('✅ All tests passed! LM Studio tool calling is working correctly.');
        } else if (results.passed === 0) {
            console.log('❌ All tests failed. Major issues with LM Studio tool calling integration.');
            console.log('\nTroubleshooting steps:');
            console.log('1. Verify LM Studio is running with mistralai/devstral-small-2507 loaded');
            console.log('2. Test basic LM Studio API functionality manually');
            console.log('3. Check if the model supports tool calling format');
            console.log('4. Verify gemini-masters CLI LM Studio integration');
        } else {
            console.log('⚠️  Mixed results. Some tool calling functionality working, some not.');
            console.log('\nPartial success suggests:');
            console.log('- Basic integration may be working');
            console.log('- Specific tool calling scenarios may have issues');
            console.log('- Model or configuration may need adjustment');
        }
        
        // Check for specific patterns in failures
        const hasApiFailure = this.testResults.some(r => !r.success && r.name.includes('API'));
        const hasCliFailure = this.testResults.some(r => !r.success && r.name.includes('CLI'));
        
        if (hasApiFailure && !hasCliFailure) {
            console.log('\n🎯 DIAGNOSIS: API-level tool calling issues');
            console.log('- LM Studio model may not support tool calling properly');
            console.log('- Check LM Studio tool calling configuration');
        } else if (!hasApiFailure && hasCliFailure) {
            console.log('\n🎯 DIAGNOSIS: CLI integration issues');
            console.log('- API tool calling works, but CLI integration has problems');
            console.log('- Check gemini-masters LM Studio adapter implementation');
        }
        
        console.log('\n' + '='.repeat(50));
        
        return results.passed === results.total;
    }
}

async function main() {
    const runner = new ToolCallingTestRunner();
    
    // Check prerequisites first
    const prereqsOk = await runner.checkPrerequisites();
    if (!prereqsOk) {
        process.exit(1);
    }
    
    // Run all tests
    const results = await runner.runAllTests();
    
    // Print comprehensive summary
    const allPassed = runner.printSummary(results);
    
    process.exit(allPassed ? 0 : 1);
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('LM Studio Tool Calling Test Runner');
    console.log('\nUsage: node run-tool-tests.js [options]');
    console.log('\nOptions:');
    console.log('  --help, -h     Show this help message');
    console.log('\nEnvironment Variables:');
    console.log('  LM_STUDIO_BASE_URL    LM Studio API base URL (default: http://127.0.0.1:1234/v1)');
    console.log('  LM_STUDIO_MODEL       Preferred model name (default: mistralai/devstral-small-2507)');
    console.log('\nPrerequisites:');
    console.log('  - LM Studio running on port 1234');
    console.log('  - Model loaded and supporting tool calling');
    console.log('  - gemini-masters CLI installed globally');
    console.log('  - Node.js version 20+');
    process.exit(0);
}

main().catch(error => {
    console.log('💥 Test runner error:', error.message);
    process.exit(1);
});