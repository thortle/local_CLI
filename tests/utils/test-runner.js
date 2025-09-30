#!/usr/bin/env node

/**
 * LM Studio Integration Test Runner
 * Automated test execution for all phases of development
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testsDir = dirname(__dirname);

// ANSI colors for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

const testPhases = {
    1: {
        name: 'Core Infrastructure',
        status: 'completed',
        tests: [
            { file: 'test-authtype.js', name: 'AuthType Enum' },
            { file: 'test-adapter.js', name: 'Adapter Creation' },
            { file: 'test-registry.js', name: 'Registry Integration' },
            { file: 'test-connection.js', name: 'Connection Validation' }
        ]
    },
    2: {
        name: 'Configuration System',
        status: 'in-development',
        tests: [
            { file: 'test-models.js', name: 'Model Definitions' },
            { file: 'test-config.js', name: 'Config Integration' },
            { file: 'test-env-vars.js', name: 'Environment Variables' }
        ]
    },
    3: {
        name: 'CLI Integration',
        status: 'planned',
        tests: [
            { file: 'test-commands.js', name: 'Command Parsing' },
            { file: 'test-switching.js', name: 'Provider Switching' }
        ]
    }
};

async function runTest(testFile, testName) {
    const startTime = Date.now();
    
    try {
        console.log(`   ${colorize('→', 'cyan')} Running ${colorize(testName, 'bright')}...`);
        
        // Import and run test
        const testModule = await import(testFile);
        const testFunction = Object.values(testModule)[0];
        
        if (typeof testFunction === 'function') {
            const success = await testFunction();
            const duration = Date.now() - startTime;
            
            if (success) {
                console.log(`   ${colorize('✅', 'green')} ${testName} ${colorize('PASSED', 'green')} ${colorize(`(${duration}ms)`, 'cyan')}`);
                return { success: true, duration, name: testName };
            } else {
                console.log(`   ${colorize('❌', 'red')} ${testName} ${colorize('FAILED', 'red')} ${colorize(`(${duration}ms)`, 'cyan')}`);
                return { success: false, duration, name: testName };
            }
        } else {
            throw new Error('Test file does not export a test function');
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`   ${colorize('💥', 'red')} ${testName} ${colorize('ERROR', 'red')} ${colorize(`(${duration}ms)`, 'cyan')}`);
        console.log(`   ${colorize('Error:', 'red')} ${error.message}`);
        return { success: false, duration, name: testName, error: error.message };
    }
}

async function runPhase(phaseNumber) {
    const phase = testPhases[phaseNumber];
    if (!phase) {
        console.log(`${colorize('❌', 'red')} Invalid phase number: ${phaseNumber}`);
        return false;
    }
    
    console.log(`\n${colorize('🧪', 'magenta')} ${colorize(`Phase ${phaseNumber}: ${phase.name}`, 'bright')}`);
    console.log(`${colorize('Status:', 'cyan')} ${phase.status}`);
    console.log(`${colorize('Tests:', 'cyan')} ${phase.tests.length}\n`);
    
    const results = [];
    const phaseDir = join(testsDir, `step${phaseNumber}`);
    
    for (const test of phase.tests) {
        const testFile = join(phaseDir, test.file);
        
        if (!existsSync(testFile)) {
            console.log(`   ${colorize('⚠️', 'yellow')} ${test.name} ${colorize('SKIPPED', 'yellow')} (file not found)`);
            results.push({ success: false, name: test.name, skipped: true });
            continue;
        }
        
        const result = await runTest(testFile, test.name);
        results.push(result);
    }
    
    // Phase summary
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const total = results.length;
    
    console.log(`\n${colorize('📊', 'blue')} Phase ${phaseNumber} Summary:`);
    console.log(`   ${colorize('✅', 'green')} Passed: ${colorize(passed, 'green')}/${total}`);
    if (failed > 0) console.log(`   ${colorize('❌', 'red')} Failed: ${colorize(failed, 'red')}/${total}`);
    if (skipped > 0) console.log(`   ${colorize('⚠️', 'yellow')} Skipped: ${colorize(skipped, 'yellow')}/${total}`);
    
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`   ${colorize('⏱️', 'cyan')} Duration: ${colorize(`${totalDuration}ms`, 'cyan')}`);
    
    return failed === 0;
}

async function runAllPhases() {
    console.log(`${colorize('🚀', 'magenta')} ${colorize('Running All Available Tests', 'bright')}\n`);
    
    let allPassed = true;
    const phaseResults = [];
    
    for (const phaseNumber of Object.keys(testPhases)) {
        const success = await runPhase(parseInt(phaseNumber));
        phaseResults.push({ phase: phaseNumber, success });
        allPassed = allPassed && success;
    }
    
    // Overall summary
    console.log(`\n${colorize('🎯', 'magenta')} ${colorize('Overall Test Results', 'bright')}`);
    phaseResults.forEach(({ phase, success }) => {
        const status = success ? colorize('PASSED', 'green') : colorize('FAILED', 'red');
        const icon = success ? '✅' : '❌';
        console.log(`   ${icon} Phase ${phase}: ${testPhases[phase].name} - ${status}`);
    });
    
    if (allPassed) {
        console.log(`\n${colorize('🎉', 'green')} ${colorize('All tests passed!', 'green')}`);
    } else {
        console.log(`\n${colorize('💥', 'red')} ${colorize('Some tests failed!', 'red')}`);
    }
    
    return allPassed;
}

async function checkLMStudio() {
    console.log(`${colorize('🔍', 'blue')} ${colorize('Checking LM Studio Connection', 'bright')}\n`);
    
    try {
        const { LMStudioContentGenerator } = await import('../../gemini-cli-masters-core/dist/src/adapters/lmStudioContentGenerator.js');
        const adapter = new LMStudioContentGenerator({ baseUrl: 'http://127.0.0.1:1234' });
        
        const connectionInfo = await adapter.validateConnection();
        const models = await adapter.getAvailableModels();
        
        console.log(`${colorize('✅', 'green')} LM Studio is running and accessible`);
        console.log(`${colorize('📊', 'blue')} Status: ${connectionInfo.status}`);
        console.log(`${colorize('📊', 'blue')} Models loaded: ${connectionInfo.modelsAvailable}`);
        console.log(`${colorize('📋', 'cyan')} Available models:`);
        
        models.forEach((model, index) => {
            console.log(`   ${index + 1}. ${colorize(model.id, 'green')} (${model.owned_by || 'local'})`);
        });
        
        return true;
    } catch (error) {
        console.log(`${colorize('❌', 'red')} LM Studio connection failed`);
        console.log(`${colorize('📋', 'yellow')} Error: ${error.message}`);
        console.log(`\n${colorize('💡', 'cyan')} To fix this:`);
        console.log(`   1. Start LM Studio application`);
        console.log(`   2. Load at least one model`);
        console.log(`   3. Enable "Local Server" on port 1234`);
        console.log(`   4. Ensure no firewall blocking localhost:1234`);
        
        return false;
    }
}

function showUsage() {
    console.log(`${colorize('📖', 'blue')} ${colorize('LM Studio Integration Test Runner', 'bright')}\n`);
    console.log(`${colorize('Usage:', 'cyan')}`);
    console.log(`   node test-runner.js [options]\n`);
    console.log(`${colorize('Options:', 'cyan')}`);
    console.log(`   ${colorize('--phase=N', 'green')}        Run specific phase (1, 2, 3)`);
    console.log(`   ${colorize('--all', 'green')}            Run all available tests`);
    console.log(`   ${colorize('--check-lmstudio', 'green')} Check LM Studio connection`);
    console.log(`   ${colorize('--help', 'green')}           Show this help message\n`);
    console.log(`${colorize('Examples:', 'cyan')}`);
    console.log(`   node test-runner.js --phase=1`);
    console.log(`   node test-runner.js --all`);
    console.log(`   node test-runner.js --check-lmstudio`);
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        showUsage();
        process.exit(0);
    }
    
    let success = false;
    
    if (args.includes('--check-lmstudio')) {
        success = await checkLMStudio();
    } else if (args.includes('--all')) {
        success = await runAllPhases();
    } else {
        const phaseArg = args.find(arg => arg.startsWith('--phase='));
        if (phaseArg) {
            const phaseNumber = parseInt(phaseArg.split('=')[1]);
            success = await runPhase(phaseNumber);
        } else {
            console.log(`${colorize('❌', 'red')} Invalid arguments. Use --help for usage information.`);
            process.exit(1);
        }
    }
    
    process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}