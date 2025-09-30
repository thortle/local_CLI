console.log('🧪 Testing Adapter Registry Integration...\n');

async function testRegistry() {
    try {
        console.log('1️⃣ Testing registry function import...');
        const { createCustomContentGenerator } = await import('../../gemini-cli-masters-core/dist/src/adapters/index.js');
        
        console.log('2️⃣ Testing LM Studio adapter creation via registry...');
        const adapter = createCustomContentGenerator('lm-studio', {
            baseUrl: 'http://127.0.0.1:1234'
        });
        
        console.log('3️⃣ Verifying adapter type...');
        if (adapter.constructor.name !== 'LMStudioContentGenerator') {
            throw new Error(`Expected LMStudioContentGenerator, got ${adapter.constructor.name}`);
        }
        
        console.log('4️⃣ Testing registry with all auth types...');
        const authTypes = [
            'openai-compatible',
            'local-llm', 
            'lm-studio',
            'anthropic',
            'azure'
        ];
        
        const expectedClasses = [
            'OpenAICompatibleContentGenerator',
            'LocalLlmContentGenerator',
            'LMStudioContentGenerator', 
            'AnthropicContentGenerator',
            'AzureContentGenerator'
        ];
        
        for (let i = 0; i < authTypes.length; i++) {
            try {
                const testAdapter = createCustomContentGenerator(authTypes[i], {});
                if (testAdapter.constructor.name !== expectedClasses[i]) {
                    throw new Error(`Auth type '${authTypes[i]}' returned wrong class: ${testAdapter.constructor.name}`);
                }
                console.log(`   ✅ ${authTypes[i]} → ${testAdapter.constructor.name}`);
            } catch (error) {
                throw new Error(`Failed to create adapter for '${authTypes[i]}': ${error.message}`);
            }
        }
        
        console.log('5️⃣ Testing invalid auth type...');
        try {
            createCustomContentGenerator('invalid-type', {});
            throw new Error('Should have thrown error for invalid auth type');
        } catch (error) {
            if (!error.message.includes('No content generator available')) {
                throw new Error(`Unexpected error message: ${error.message}`);
            }
            console.log('   ✅ Invalid auth type properly rejected');
        }
        
        console.log('✅ Registry integration test passed');
        console.log(`📋 Supported auth types: ${authTypes.join(', ')}`);
        console.log(`✅ LM Studio registry mapping: lm-studio → LMStudioContentGenerator\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Registry test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testRegistry().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testRegistry };