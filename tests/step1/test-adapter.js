console.log('🧪 Testing LM Studio Adapter Creation...\n');

async function testAdapter() {
    try {
        console.log('1️⃣ Testing adapter import...');
        const { LMStudioContentGenerator } = await import('../../gemini-cli-masters-core/dist/src/adapters/lmStudioContentGenerator.js');
        
        console.log('2️⃣ Testing adapter creation with defaults...');
        const adapter1 = new LMStudioContentGenerator({});
        
        if (adapter1.config.baseUrl !== 'http://127.0.0.1:1234') {
            throw new Error(`Expected default baseUrl 'http://127.0.0.1:1234', got '${adapter1.config.baseUrl}'`);
        }
        
        if (adapter1.config.apiKey !== 'lm-studio') {
            throw new Error(`Expected default apiKey 'lm-studio', got '${adapter1.config.apiKey}'`);
        }
        
        if (adapter1.config.timeout !== 30000) {
            throw new Error(`Expected default timeout 30000, got '${adapter1.config.timeout}'`);
        }
        
        console.log('3️⃣ Testing adapter creation with custom config...');
        const customConfig = {
            baseUrl: 'http://localhost:5000',
            apiKey: 'custom-key',
            timeout: 60000
        };
        
        const adapter2 = new LMStudioContentGenerator(customConfig);
        
        if (adapter2.config.baseUrl !== 'http://localhost:5000') {
            throw new Error(`Expected custom baseUrl 'http://localhost:5000', got '${adapter2.config.baseUrl}'`);
        }
        
        console.log('4️⃣ Testing adapter inheritance...');
        if (!(adapter1 instanceof LMStudioContentGenerator)) {
            throw new Error('Adapter is not instance of LMStudioContentGenerator');
        }
        
        // Test that it extends OpenAI compatible generator
        const { OpenAICompatibleContentGenerator } = await import('../../gemini-cli-masters-core/dist/src/adapters/openaiCompatibleContentGenerator.js');
        if (!(adapter1 instanceof OpenAICompatibleContentGenerator)) {
            throw new Error('Adapter does not extend OpenAICompatibleContentGenerator');
        }
        
        console.log('5️⃣ Testing adapter methods exist...');
        const requiredMethods = ['generateContent', 'validateConnection', 'getAvailableModels', 'convertToOpenAIFormat'];
        
        for (const method of requiredMethods) {
            if (typeof adapter1[method] !== 'function') {
                throw new Error(`Required method '${method}' not found or not a function`);
            }
        }
        
        console.log('✅ LM Studio adapter test passed');
        console.log(`📋 Default config: baseUrl=${adapter1.config.baseUrl}, timeout=${adapter1.config.timeout}ms`);
        console.log(`✅ Extends OpenAICompatibleContentGenerator: true`);
        console.log(`✅ Required methods present: ${requiredMethods.length}/${requiredMethods.length}\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Adapter test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testAdapter().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testAdapter };