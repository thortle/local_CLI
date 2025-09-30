/**
 * Test Helper Utilities
 * Common functions and utilities for LM Studio integration tests
 */

export class TestHelper {
    static colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m'
    };

    /**
     * Colorize text for console output
     */
    static colorize(text, color) {
        return `${this.colors[color]}${text}${this.colors.reset}`;
    }

    /**
     * Create a test result object
     */
    static createResult(success, message, duration = 0, data = null) {
        return {
            success,
            message,
            duration,
            data,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validate LM Studio connection
     */
    static async validateLMStudio(baseUrl = 'http://127.0.0.1:1234') {
        try {
            const response = await fetch(`${baseUrl}/v1/models`, {
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                available: true,
                modelsCount: data.data?.length || 0,
                models: data.data?.map(m => m.id) || []
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }

    /**
     * Wait for a specified duration
     */
    static async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry a function with exponential backoff
     */
    static async retry(fn, maxAttempts = 3, baseDelay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                if (attempt < maxAttempts) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`   ${this.colorize('⏳', 'yellow')} Retry ${attempt}/${maxAttempts} in ${delay}ms...`);
                    await this.wait(delay);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Test environment checker
     */
    static async checkEnvironment() {
        const checks = [];
        
        // Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        checks.push({
            name: 'Node.js version',
            success: majorVersion >= 20,
            message: `${nodeVersion} (requires >=20.0.0)`,
            value: nodeVersion
        });
        
        // LM Studio connection
        const lmStudio = await this.validateLMStudio();
        checks.push({
            name: 'LM Studio connection',
            success: lmStudio.available,
            message: lmStudio.available 
                ? `Connected with ${lmStudio.modelsCount} models`
                : `Failed: ${lmStudio.error}`,
            value: lmStudio
        });
        
        // Project structure
        const { existsSync } = await import('fs');
        const requiredPaths = [
            '../../gemini-cli-masters-core/dist/src/core/contentGenerator.js',
            '../../gemini-cli-masters-core/dist/src/adapters/lmStudioContentGenerator.js',
            '../../gemini-cli-masters-core/dist/src/adapters/index.js'
        ];
        
        for (const path of requiredPaths) {
            checks.push({
                name: `File: ${path.split('/').pop()}`,
                success: existsSync(new URL(path, import.meta.url)),
                message: existsSync(new URL(path, import.meta.url)) ? 'Found' : 'Missing',
                value: path
            });
        }
        
        return checks;
    }

    /**
     * Format test duration
     */
    static formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    }

    /**
     * Create a mock config for testing
     */
    static createMockConfig(overrides = {}) {
        return {
            baseUrl: 'http://127.0.0.1:1234',
            apiKey: 'test-key',
            timeout: 10000,
            model: 'test-model',
            ...overrides
        };
    }

    /**
     * Validate adapter structure
     */
    static validateAdapterStructure(adapter, expectedMethods = []) {
        const issues = [];
        
        // Check if adapter exists
        if (!adapter) {
            issues.push('Adapter is null or undefined');
            return issues;
        }
        
        // Check config property
        if (!adapter.config) {
            issues.push('Adapter missing config property');
        }
        
        // Check required methods
        const defaultMethods = ['generateContent', 'convertToOpenAIFormat'];
        const allMethods = [...defaultMethods, ...expectedMethods];
        
        for (const method of allMethods) {
            if (typeof adapter[method] !== 'function') {
                issues.push(`Missing or invalid method: ${method}`);
            }
        }
        
        return issues;
    }

    /**
     * Generate test summary report
     */
    static generateSummary(results) {
        const total = results.length;
        const passed = results.filter(r => r.success).length;
        const failed = total - passed;
        const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
        
        return {
            total,
            passed,
            failed,
            passRate: total > 0 ? (passed / total * 100).toFixed(1) : 0,
            totalDuration: this.formatDuration(totalDuration),
            results
        };
    }
}

// Standalone execution for environment check
if (import.meta.url === `file://${process.argv[1]}`) {
    if (process.argv.includes('--check-lmstudio')) {
        console.log('🔍 Checking LM Studio connection...\n');
        
        TestHelper.validateLMStudio().then(result => {
            if (result.available) {
                console.log(`✅ LM Studio is available`);
                console.log(`📊 Models: ${result.modelsCount}`);
                if (result.models.length > 0) {
                    console.log(`📋 Loaded models:`);
                    result.models.forEach((model, i) => {
                        console.log(`   ${i + 1}. ${model}`);
                    });
                }
            } else {
                console.log(`❌ LM Studio not available: ${result.error}`);
            }
            
            process.exit(result.available ? 0 : 1);
        });
    } else {
        console.log('🔧 Checking test environment...\n');
        
        TestHelper.checkEnvironment().then(checks => {
            checks.forEach(check => {
                const icon = check.success ? '✅' : '❌';
                const color = check.success ? 'green' : 'red';
                console.log(`${icon} ${check.name}: ${TestHelper.colorize(check.message, color)}`);
            });
            
            const allPassed = checks.every(check => check.success);
            console.log(`\n${allPassed ? '🎉 Environment ready!' : '🔧 Environment needs setup'}`);
            
            process.exit(allPassed ? 0 : 1);
        });
    }
}

export default TestHelper;