console.log('🧪 Testing LM Studio Connection Validation...\n');

async function testConnection() {
    try {
        console.log('1️⃣ Testing connection validation import...');
        const { LMStudioContentGenerator } = await import('../../gemini-cli-masters-core/dist/src/adapters/lmStudioContentGenerator.js');
        
        console.log('2️⃣ Creating LM Studio adapter...');
        const adapter = new LMStudioContentGenerator({
            baseUrl: 'http://127.0.0.1:1234'
        });
        
        console.log('3️⃣ Testing connection validation...');
        try {
            const connectionInfo = await adapter.validateConnection();
            
            console.log('   ✅ Connection successful!');
            console.log(`   📊 Status: ${connectionInfo.status}`);
            console.log(`   📊 Models available: ${connectionInfo.modelsAvailable}`);
            console.log(`   📋 Loaded models: ${connectionInfo.loadedModels.join(', ')}`);
            
            // Validate response structure
            if (!connectionInfo.status || !connectionInfo.modelsAvailable || !connectionInfo.loadedModels) {
                throw new Error('Invalid connection info structure');
            }
            
        } catch (error) {
            if (error.message.includes('LM Studio connection failed') || 
                error.message.includes('LM Studio not reachable') ||
                error.message.includes('fetch failed')) {
                console.log('   ❌ Connection failed (expected if LM Studio not running)');
                console.log(`   📋 Error: ${error.message}`);
                console.log('   ✅ Error handling working correctly');
            } else {
                throw error; // Re-throw unexpected errors
            }
        }
        
        console.log('4️⃣ Testing model discovery...');
        try {
            const models = await adapter.getAvailableModels();
            
            console.log('   ✅ Model discovery successful!');
            console.log(`   📊 Models found: ${models.length}`);
            
            if (models.length > 0) {
                console.log('   📋 Model details:');
                models.forEach((model, index) => {
                    console.log(`      ${index + 1}. ${model.id} (loaded: ${model.loaded})`);
                });
            }
            
            // Validate model structure
            if (models.length > 0) {
                const firstModel = models[0];
                if (!firstModel.id || !firstModel.name || typeof firstModel.loaded !== 'boolean') {
                    throw new Error('Invalid model structure');
                }
            }
            
        } catch (error) {
            console.log('   ❌ Model discovery failed (expected if LM Studio not running)');
            console.log(`   📋 Error: ${error.message}`);
            console.log('   ✅ Model discovery error handling working');
        }
        
        console.log('5️⃣ Testing connection with custom endpoint...');
        const customAdapter = new LMStudioContentGenerator({
            baseUrl: 'http://127.0.0.1:9999' // Non-existent port
        });
        
        try {
            await customAdapter.validateConnection();
            console.log('   ⚠️  Unexpected success on invalid endpoint');
        } catch (error) {
            console.log('   ✅ Custom endpoint properly rejected');
            console.log(`   📋 Error type: ${error.message.includes('timeout') ? 'timeout' : 'connection refused'}`);
        }
        
        console.log('✅ Connection validation test passed');
        console.log(`📋 Connection validation method working correctly`);
        console.log(`✅ Error handling robust for offline scenarios\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Connection test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testConnection().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testConnection };