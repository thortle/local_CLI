console.log('🧪 Testing LM Studio Environment Variable Handling...\n');

async function testEnvVars() {
    try {
        console.log('1️⃣ Testing environment variable support import...');
        const { createContentGeneratorConfig, AuthType } = await import('../../gemini-cli-masters-core/dist/src/core/contentGenerator.js');
        
        // Store original environment
        const originalEnv = {
            LM_STUDIO_API_KEY: process.env.LM_STUDIO_API_KEY,
            LM_STUDIO_BASE_URL: process.env.LM_STUDIO_BASE_URL,
            LM_STUDIO_MODEL: process.env.LM_STUDIO_MODEL
        };
        
        console.log('2️⃣ Testing default values without environment variables...');
        
        // Clear all LM Studio environment variables
        delete process.env.LM_STUDIO_API_KEY;
        delete process.env.LM_STUDIO_BASE_URL;
        delete process.env.LM_STUDIO_MODEL;
        
        const defaultConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (defaultConfig.apiKey !== 'lm-studio') {
            throw new Error(`Expected default apiKey 'lm-studio', got '${defaultConfig.apiKey}'`);
        }
        
        if (defaultConfig.baseUrl !== 'http://127.0.0.1:1234') {
            throw new Error(`Expected default baseUrl 'http://127.0.0.1:1234', got '${defaultConfig.baseUrl}'`);
        }
        
        console.log('   ✅ Default values working without environment variables');
        
        console.log('3️⃣ Testing LM_STUDIO_API_KEY environment variable...');
        
        process.env.LM_STUDIO_API_KEY = 'custom-api-key-test';
        const apiKeyConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (apiKeyConfig.apiKey !== 'custom-api-key-test') {
            throw new Error(`Expected custom apiKey 'custom-api-key-test', got '${apiKeyConfig.apiKey}'`);
        }
        
        console.log('   ✅ LM_STUDIO_API_KEY environment variable working');
        
        console.log('4️⃣ Testing LM_STUDIO_BASE_URL environment variable...');
        
        process.env.LM_STUDIO_BASE_URL = 'http://localhost:9999';
        const baseUrlConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (baseUrlConfig.baseUrl !== 'http://localhost:9999') {
            throw new Error(`Expected custom baseUrl 'http://localhost:9999', got '${baseUrlConfig.baseUrl}'`);
        }
        
        console.log('   ✅ LM_STUDIO_BASE_URL environment variable working');
        
        console.log('5️⃣ Testing LM_STUDIO_MODEL environment variable...');
        
        process.env.LM_STUDIO_MODEL = 'mistralai/devstral-small-2507';
        const modelConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (modelConfig.model !== 'mistralai/devstral-small-2507') {
            throw new Error(`Expected custom model 'mistralai/devstral-small-2507', got '${modelConfig.model}'`);
        }
        
        console.log('   ✅ LM_STUDIO_MODEL environment variable working');
        
        console.log('6️⃣ Testing all environment variables together...');
        
        process.env.LM_STUDIO_API_KEY = 'full-test-key';
        process.env.LM_STUDIO_BASE_URL = 'http://full-test:7777';
        process.env.LM_STUDIO_MODEL = 'qwen/qwen3-coder-30b';
        
        const fullConfig = await createContentGeneratorConfig('ignored-model', AuthType.USE_LM_STUDIO, null);
        
        if (fullConfig.apiKey !== 'full-test-key') {
            throw new Error(`Expected full apiKey 'full-test-key', got '${fullConfig.apiKey}'`);
        }
        
        if (fullConfig.baseUrl !== 'http://full-test:7777') {
            throw new Error(`Expected full baseUrl 'http://full-test:7777', got '${fullConfig.baseUrl}'`);
        }
        
        if (fullConfig.model !== 'qwen/qwen3-coder-30b') {
            throw new Error(`Expected full model 'qwen/qwen3-coder-30b', got '${fullConfig.model}'`);
        }
        
        console.log('   ✅ All environment variables working together');
        
        console.log('7️⃣ Testing environment variable precedence over config object...');
        
        const mockConfig = {
            getApiKeys: () => ({
                lmStudioApiKey: 'config-api-key',
                lmStudioBaseUrl: 'http://config-server:5000',
                lmStudioModel: 'config-model'
            })
        };
        
        // Environment variables should take precedence
        const precedenceConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, mockConfig);
        
        if (precedenceConfig.apiKey !== 'full-test-key') {
            throw new Error(`Environment variable should take precedence for apiKey`);
        }
        
        if (precedenceConfig.baseUrl !== 'http://full-test:7777') {
            throw new Error(`Environment variable should take precedence for baseUrl`);
        }
        
        if (precedenceConfig.model !== 'qwen/qwen3-coder-30b') {
            throw new Error(`Environment variable should take precedence for model`);
        }
        
        console.log('   ✅ Environment variables take precedence over config');
        
        console.log('8️⃣ Testing invalid model environment variable...');
        
        process.env.LM_STUDIO_MODEL = 'invalid-model-that-does-not-exist';
        const invalidModelConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        // Should fall back to default model
        const { getDefaultLMStudioModel } = await import('../../gemini-cli-masters-core/dist/src/config/models.js');
        const expectedDefault = getDefaultLMStudioModel();
        
        if (invalidModelConfig.model !== expectedDefault) {
            throw new Error(`Should fallback to default model when env model is invalid`);
        }
        
        console.log('   ✅ Invalid model environment variable handled correctly');
        
        console.log('9️⃣ Testing empty environment variables...');
        
        process.env.LM_STUDIO_API_KEY = '';
        process.env.LM_STUDIO_BASE_URL = '';
        process.env.LM_STUDIO_MODEL = '';
        
        const emptyEnvConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        // Empty strings should fallback to defaults
        if (emptyEnvConfig.apiKey !== 'lm-studio') {
            throw new Error(`Empty env var should fallback to default apiKey`);
        }
        
        if (emptyEnvConfig.baseUrl !== 'http://127.0.0.1:1234') {
            throw new Error(`Empty env var should fallback to default baseUrl`);
        }
        
        console.log('   ✅ Empty environment variables handled correctly');
        
        // Restore original environment
        Object.keys(originalEnv).forEach(key => {
            if (originalEnv[key] !== undefined) {
                process.env[key] = originalEnv[key];
            } else {
                delete process.env[key];
            }
        });
        
        console.log('✅ Environment variable handling test passed');
        console.log(`📋 Supported variables: LM_STUDIO_API_KEY, LM_STUDIO_BASE_URL, LM_STUDIO_MODEL`);
        console.log(`📋 Precedence: Environment > Config Object > Defaults`);
        console.log(`📋 Fallback: Invalid models use default model`);
        console.log(`✅ Empty values properly handled\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Environment variable handling test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testEnvVars().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testEnvVars };