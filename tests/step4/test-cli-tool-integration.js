#!/usr/bin/env node

/**
 * LM Studio CLI Tool Integration Test
 * 
 * Tests tool calling functionality through the actual Gemini CLI
 * to simulate real user experience with tool-enabled prompts.
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing LM Studio CLI Tool Integration...\n');

class CLIToolTest {
    constructor() {
        this.testDir = '/tmp/gemini-cli-test';
        this.testFile = join(this.testDir, 'test-file.txt');
        this.timeout = 60000; // 60 second timeout
    }

    async setupTestEnvironment() {
        console.log('1️⃣ Setting up test environment...');
        
        // Create test directory and file
        try {
            const { mkdirSync } = await import('fs');
            mkdirSync(this.testDir, { recursive: true });
            writeFileSync(this.testFile, 'This is a test file for CLI tool integration.\nIt contains sample content for reading.');
            console.log('✅ Test environment created');
            console.log(`📁 Test directory: ${this.testDir}`);
            console.log(`📄 Test file: ${this.testFile}`);
            return true;
        } catch (error) {
            console.log('❌ Failed to setup test environment:', error.message);
            return false;
        }
    }

    async testCLIToolCalling() {
        console.log('\n2️⃣ Testing CLI tool calling with LM Studio...');
        
        // First verify gemini-masters is available
        try {
            const { execSync } = await import('child_process');
            execSync('which gemini-masters', { stdio: 'pipe' });
            console.log('✅ gemini-masters CLI found');
        } catch (error) {
            console.log('❌ gemini-masters CLI not found in PATH');
            console.log('📋 Please ensure gemini-masters is installed globally');
            return false;
        }

        return new Promise((resolve) => {
            console.log('🚀 Starting CLI session...');
            
            // Start the CLI process
            const cli = spawn('gemini-masters', [], {
                cwd: this.testDir,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    LM_STUDIO_BASE_URL: 'http://127.0.0.1:1234/v1',
                    LM_STUDIO_MODEL: 'mistralai/devstral-small-2507'
                }
            });

            let output = '';
            let authenticationSent = false;
            let modelSwitchSent = false;
            let toolTestSent = false;
            let startTime = Date.now();

            // Set overall timeout
            const timeoutId = setTimeout(() => {
                console.log('❌ CLI test timed out after 60 seconds');
                cli.kill('SIGTERM');
                resolve(false);
            }, this.timeout);

            cli.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                process.stdout.write(chunk); // Show real-time output
                
                // Handle authentication prompt
                if (chunk.includes('How would you like to authenticate?') && !authenticationSent) {
                    console.log('\n🔐 Authentication prompt detected');
                    // Look for LM Studio option and select it
                    setTimeout(() => {
                        console.log('📤 Selecting LM Studio authentication...');
                        cli.stdin.write('6\n'); // Assuming LM Studio is option 6
                        authenticationSent = true;
                    }, 1000);
                }
                
                // Handle model switching after authentication
                if ((chunk.includes('>') || chunk.includes('gemini')) && authenticationSent && !modelSwitchSent) {
                    setTimeout(() => {
                        console.log('📤 Switching to LM Studio model...');
                        cli.stdin.write('/model lmstudio\n');
                        modelSwitchSent = true;
                    }, 1000);
                }
                
                // Send tool calling test after model switch
                if (chunk.includes('✅') && chunk.includes('lmstudio') && modelSwitchSent && !toolTestSent) {
                    setTimeout(() => {
                        console.log('📤 Sending tool calling test prompt...');
                        const testPrompt = `Please read the contents of the file "${this.testFile}" and tell me what it contains. Use the read-file tool to access the file.`;
                        cli.stdin.write(testPrompt + '\n');
                        toolTestSent = true;
                    }, 2000);
                }
                
                // Check for tool calling success indicators
                if (toolTestSent) {
                    if (chunk.includes('read-file') || chunk.includes('Reading file') || chunk.includes('test file')) {
                        console.log('\n✅ Tool calling detected in CLI output!');
                        clearTimeout(timeoutId);
                        setTimeout(() => {
                            cli.stdin.write('exit\n');
                            cli.kill('SIGTERM');
                            resolve(true);
                        }, 2000);
                    }
                    
                    // Check for stalling indicators
                    const stallTime = Date.now() - startTime;
                    if (stallTime > 30000 && !chunk.includes('tool') && !chunk.includes('file')) {
                        console.log('\n⚠️  Possible stalling detected - no tool activity in 30 seconds');
                    }
                }
            });

            cli.stderr.on('data', (data) => {
                const errorChunk = data.toString();
                console.log(`🔴 CLI Error: ${errorChunk}`);
                
                if (errorChunk.includes('LM Studio') && errorChunk.includes('not available')) {
                    console.log('❌ LM Studio not available to CLI');
                    clearTimeout(timeoutId);
                    cli.kill('SIGTERM');
                    resolve(false);
                }
            });

            cli.on('exit', (code) => {
                clearTimeout(timeoutId);
                console.log(`\n🔚 CLI process exited with code: ${code}`);
                
                // Analyze the full output for tool calling evidence
                const hasToolCalling = output.includes('read-file') || 
                                     output.includes('Reading file') || 
                                     output.includes('tool_calls') ||
                                     output.includes('function_call');
                
                if (hasToolCalling) {
                    console.log('✅ Tool calling evidence found in output');
                    resolve(true);
                } else {
                    console.log('❌ No tool calling evidence found');
                    console.log('📋 This suggests the model may be stalling or not using tools properly');
                    resolve(false);
                }
            });

            cli.on('error', (error) => {
                clearTimeout(timeoutId);
                console.log('❌ CLI process error:', error.message);
                resolve(false);
            });
        });
    }

    async testDirectToolPrompt() {
        console.log('\n3️⃣ Testing direct tool-enabled prompt...');
        
        return new Promise((resolve) => {
            const cli = spawn('gemini-masters', [], {
                cwd: this.testDir,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    LM_STUDIO_BASE_URL: 'http://127.0.0.1:1234/v1',
                    LM_STUDIO_MODEL: 'mistralai/devstral-small-2507'
                }
            });

            let isReady = false;
            let startTime = Date.now();
            
            const timeoutId = setTimeout(() => {
                console.log('❌ Direct prompt test timed out');
                cli.kill('SIGTERM');
                resolve(false);
            }, 45000);

            cli.stdout.on('data', (data) => {
                const chunk = data.toString();
                process.stdout.write(chunk);
                
                if (chunk.includes('>') && !isReady) {
                    isReady = true;
                    setTimeout(() => {
                        console.log('📤 Sending direct tool prompt...');
                        // This is the exact prompt that was stalling
                        const prompt = `Please list the files in the current directory and then read the contents of any text files you find. Use the appropriate tools to accomplish this task.`;
                        cli.stdin.write(prompt + '\n');
                    }, 1000);
                }
                
                // Look for tool usage indicators
                if (isReady && (chunk.includes('ls') || chunk.includes('read-file') || chunk.includes('directory'))) {
                    console.log('\n✅ Tool usage detected in direct prompt!');
                    clearTimeout(timeoutId);
                    setTimeout(() => {
                        cli.stdin.write('exit\n');
                        resolve(true);
                    }, 3000);
                }
            });

            cli.on('exit', () => {
                clearTimeout(timeoutId);
                resolve(false);
            });
        });
    }

    async cleanup() {
        console.log('\n4️⃣ Cleaning up test environment...');
        try {
            const { rmSync } = await import('fs');
            rmSync(this.testDir, { recursive: true, force: true });
            console.log('✅ Test environment cleaned up');
        } catch (error) {
            console.log('⚠️  Cleanup warning:', error.message);
        }
    }
}

async function runCLIToolTests() {
    const tester = new CLIToolTest();
    
    try {
        const setupSuccess = await tester.setupTestEnvironment();
        if (!setupSuccess) {
            return false;
        }
        
        const cliTestSuccess = await tester.testCLIToolCalling();
        const directTestSuccess = await tester.testDirectToolPrompt();
        
        await tester.cleanup();
        
        const overallSuccess = cliTestSuccess || directTestSuccess;
        
        console.log('\n📊 CLI Tool Integration Results:');
        console.log(`   CLI Tool Test: ${cliTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Direct Prompt Test: ${directTestSuccess ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Overall: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
        
        if (!overallSuccess) {
            console.log('\n🔍 Troubleshooting suggestions:');
            console.log('   1. Verify LM Studio is running with a model loaded');
            console.log('   2. Check that the model supports tool calling');
            console.log('   3. Test tool calling directly via LM Studio API');
            console.log('   4. Verify gemini-masters CLI LM Studio integration');
        }
        
        return overallSuccess;
        
    } catch (error) {
        console.log('❌ CLI tool test error:', error.message);
        await tester.cleanup();
        return false;
    }
}

// Run the tests
runCLIToolTests().then(success => {
    console.log(`\n${success ? '🎉' : '💥'} CLI Tool Integration ${success ? 'PASSED' : 'FAILED'}\n`);
    process.exit(success ? 0 : 1);
});