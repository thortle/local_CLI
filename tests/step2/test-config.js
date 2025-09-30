console.log('🧪 Testing LM Studio Configuration Integration...\n');

async function testConfig() {
    try {
        console.log('1️⃣ Testing configuration function import...');
        const { createContentGeneratorConfig, AuthType } = await import('../../gemini-cli-masters-core/dist/src/core/contentGenerator.js');
        
        console.log('2️⃣ Testing LM Studio AuthType...');
        if (AuthType.USE_LM_STUDIO !== 'lm-studio') {
            throw new Error(`Expected AuthType.USE_LM_STUDIO to be 'lm-studio', got '${AuthType.USE_LM_STUDIO}'`);
        }
        
        console.log('3️⃣ Testing basic LM Studio config creation...');
        const basicConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (!basicConfig) {
            throw new Error('createContentGeneratorConfig returned null/undefined');
        }
        
        if (basicConfig.authType !== AuthType.USE_LM_STUDIO) {
            throw new Error(`Expected authType 'lm-studio', got '${basicConfig.authType}'`);
        }
        
        // Test default values
        if (basicConfig.apiKey !== 'lm-studio') {
            throw new Error(`Expected default apiKey 'lm-studio', got '${basicConfig.apiKey}'`);
        }
        
        if (basicConfig.baseUrl !== 'http://127.0.0.1:1234') {
            throw new Error(`Expected default baseUrl 'http://127.0.0.1:1234', got '${basicConfig.baseUrl}'`);
        }
        
        console.log('   ✅ Basic configuration created with defaults');
        
        console.log('4️⃣ Testing configuration with environment variables...');
        
        // Set environment variables
        const originalEnv = {
            LM_STUDIO_API_KEY: process.env.LM_STUDIO_API_KEY,
            LM_STUDIO_BASE_URL: process.env.LM_STUDIO_BASE_URL,
            LM_STUDIO_MODEL: process.env.LM_STUDIO_MODEL
        };
        
        process.env.LM_STUDIO_API_KEY = 'test-api-key';
        process.env.LM_STUDIO_BASE_URL = 'http://test-server:5000';
        process.env.LM_STUDIO_MODEL = 'mistralai/devstral-small-2507';
        
        const envConfig = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, null);
        
        if (envConfig.apiKey !== 'test-api-key') {
            throw new Error(`Expected custom apiKey 'test-api-key', got '${envConfig.apiKey}'`);
        }
        
        if (envConfig.baseUrl !== 'http://test-server:5000') {
            throw new Error(`Expected custom baseUrl 'http://test-server:5000', got '${envConfig.baseUrl}'`);
        }
        
        if (envConfig.model !== 'mistralai/devstral-small-2507') {
            throw new Error(`Expected custom model 'mistralai/devstral-small-2507', got '${envConfig.model}'`);
        }
        
        console.log('   ✅ Environment variables properly applied');
        
        console.log('5️⃣ Testing model validation in config...');
        
        // Test with valid LM Studio model
        process.env.LM_STUDIO_MODEL = 'qwen/qwen3-coder-30b';
        const validModelConfig = await createContentGeneratorConfig('qwen/qwen3-coder-30b', AuthType.USE_LM_STUDIO, null);
        
        if (validModelConfig.model !== 'qwen/qwen3-coder-30b') {
            throw new Error(`Expected model 'qwen/qwen3-coder-30b', got '${validModelConfig.model}'`);
        }
        
        console.log('   ✅ Valid model selection working');
        
        console.log('6️⃣ Testing default model fallback...');
        
        // Clear environment model and test with invalid model
        delete process.env.LM_STUDIO_MODEL;
        const fallbackConfig = await createContentGeneratorConfig('invalid-model-name', AuthType.USE_LM_STUDIO, null);
        
        // Should fallback to default model
        const { getDefaultLMStudioModel } = await import('../../gemini-cli-masters-core/dist/src/config/models.js');
        const expectedDefault = getDefaultLMStudioModel();
        
        if (fallbackConfig.model !== expectedDefault) {
            throw new Error(`Expected fallback to default model '${expectedDefault}', got '${fallbackConfig.model}'`);
        }
        
        console.log(`   ✅ Fallback to default model: ${expectedDefault}`);
        
        console.log('7️⃣ Testing mock config object...');
        
        // Clear environment variables to test config object priority
        delete process.env.LM_STUDIO_API_KEY;
        delete process.env.LM_STUDIO_BASE_URL;
        delete process.env.LM_STUDIO_MODEL;
        
        const mockConfig = {
            getApiKeys: () => ({
                lmStudioApiKey: 'mock-api-key',
                lmStudioBaseUrl: 'http://mock-server:8080',
                lmStudioModel: 'text-embedding-nomic-embed-text-v1.5'
            }),
            getModel: () => 'text-embedding-nomic-embed-text-v1.5'
        };
        
        const mockConfigResult = await createContentGeneratorConfig('test-model', AuthType.USE_LM_STUDIO, mockConfig);
        
        if (mockConfigResult.apiKey !== 'mock-api-key') {
            throw new Error(`Expected mock apiKey 'mock-api-key', got '${mockConfigResult.apiKey}'`);
        }
        
        if (mockConfigResult.baseUrl !== 'http://mock-server:8080') {
            throw new Error(`Expected mock baseUrl 'http://mock-server:8080', got '${mockConfigResult.baseUrl}'`);
        }
        
        if (mockConfigResult.model !== 'text-embedding-nomic-embed-text-v1.5') {
            throw new Error(`Expected mock model 'text-embedding-nomic-embed-text-v1.5', got '${mockConfigResult.model}'`);
        }
        
        console.log('   ✅ Mock config object working');
        
        console.log('8️⃣ Testing config structure...');
        
        const requiredFields = ['model', 'authType', 'apiKey', 'baseUrl'];
        
        for (const field of requiredFields) {
            if (!(field in basicConfig)) {
                throw new Error(`Missing required field in config: ${field}`);
            }
        }
        
        console.log('   ✅ Configuration structure complete');
        
        // Restore original environment
        Object.keys(originalEnv).forEach(key => {
            if (originalEnv[key] !== undefined) {
                process.env[key] = originalEnv[key];
            } else {
                delete process.env[key];
            }
        });
        
        console.log('✅ Configuration integration test passed');
        console.log(`📋 AuthType: ${AuthType.USE_LM_STUDIO}`);
        console.log(`📋 Default endpoint: http://127.0.0.1:1234`);
        console.log(`📋 Environment variables: LM_STUDIO_API_KEY, LM_STUDIO_BASE_URL, LM_STUDIO_MODEL`);
        console.log(`✅ Model validation and fallback working\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Configuration integration test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testConfig().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testConfig };