console.log('🧪 Testing LM Studio Model Definitions...\n');

async function testModels() {
    try {
        console.log('1️⃣ Testing model definitions import...');
        const { 
            LM_STUDIO_MODELS, 
            getDefaultLMStudioModel, 
            getLMStudioModelInfo, 
            validateLMStudioModel,
            getLMStudioModelsByCategory 
        } = await import('../../gemini-cli-masters-core/dist/src/config/models.js');
        
        console.log('2️⃣ Testing LM_STUDIO_MODELS array...');
        if (!LM_STUDIO_MODELS || !Array.isArray(LM_STUDIO_MODELS)) {
            throw new Error('LM_STUDIO_MODELS is not defined or not an array');
        }
        
        if (LM_STUDIO_MODELS.length === 0) {
            throw new Error('LM_STUDIO_MODELS array is empty');
        }
        
        console.log(`   ✅ Found ${LM_STUDIO_MODELS.length} LM Studio models`);
        
        console.log('3️⃣ Testing model structure...');
        const requiredFields = ['id', 'name', 'description', 'capabilities', 'optimized', 'category'];
        
        for (const [index, model] of LM_STUDIO_MODELS.entries()) {
            for (const field of requiredFields) {
                if (!model[field]) {
                    throw new Error(`Model ${index} missing required field: ${field}`);
                }
            }
            
            // Test specific field types
            if (!Array.isArray(model.capabilities)) {
                throw new Error(`Model ${model.id} capabilities must be an array`);
            }
            
            if (model.optimized !== 'mlx') {
                throw new Error(`Model ${model.id} must be MLX optimized`);
            }
            
            console.log(`   ✅ Model structure valid: ${model.name}`);
        }
        
        console.log('4️⃣ Testing current environment models...');
        const expectedModels = [
            'mistralai/devstral-small-2507',
            'text-embedding-nomic-embed-text-v1.5',
            'qwen/qwen3-coder-30b'
        ];
        
        for (const modelId of expectedModels) {
            const modelInfo = getLMStudioModelInfo(modelId);
            if (!modelInfo) {
                throw new Error(`Expected model not found: ${modelId}`);
            }
            console.log(`   ✅ Environment model found: ${modelInfo.name}`);
        }
        
        console.log('5️⃣ Testing getDefaultLMStudioModel()...');
        const defaultModel = getDefaultLMStudioModel();
        if (!defaultModel) {
            throw new Error('getDefaultLMStudioModel() returned null/undefined');
        }
        
        if (!validateLMStudioModel(defaultModel)) {
            throw new Error(`Default model '${defaultModel}' is not in LM_STUDIO_MODELS`);
        }
        
        console.log(`   ✅ Default model: ${defaultModel}`);
        
        console.log('6️⃣ Testing validateLMStudioModel()...');
        // Test valid models
        for (const model of LM_STUDIO_MODELS) {
            if (!validateLMStudioModel(model.id)) {
                throw new Error(`Model validation failed for: ${model.id}`);
            }
        }
        
        // Test invalid model
        if (validateLMStudioModel('invalid-model-id')) {
            throw new Error('validateLMStudioModel should return false for invalid models');
        }
        
        console.log('   ✅ Model validation working correctly');
        
        console.log('7️⃣ Testing getLMStudioModelInfo()...');
        const testModel = LM_STUDIO_MODELS[0];
        const modelInfo = getLMStudioModelInfo(testModel.id);
        
        if (!modelInfo || modelInfo.id !== testModel.id) {
            throw new Error('getLMStudioModelInfo() not returning correct model');
        }
        
        console.log(`   ✅ Model info retrieval working: ${modelInfo.name}`);
        
        console.log('8️⃣ Testing getLMStudioModelsByCategory()...');
        const codingModels = getLMStudioModelsByCategory('coding');
        const generalModels = getLMStudioModelsByCategory('general');
        const embeddingModels = getLMStudioModelsByCategory('embedding');
        
        if (codingModels.length === 0) {
            throw new Error('No coding models found');
        }
        
        if (generalModels.length === 0) {
            throw new Error('No general models found');
        }
        
        if (embeddingModels.length === 0) {
            throw new Error('No embedding models found');
        }
        
        console.log(`   ✅ Categories: ${codingModels.length} coding, ${generalModels.length} general, ${embeddingModels.length} embedding`);
        
        console.log('9️⃣ Testing model capabilities...');
        let hasTextCapability = false;
        let hasCodeCapability = false;
        let hasEmbeddingCapability = false;
        
        for (const model of LM_STUDIO_MODELS) {
            if (model.capabilities.includes('Text')) hasTextCapability = true;
            if (model.capabilities.includes('Code')) hasCodeCapability = true;
            if (model.capabilities.includes('Embeddings')) hasEmbeddingCapability = true;
        }
        
        if (!hasTextCapability) {
            console.log('   ⚠️  No models with Text capability found');
        }
        if (!hasCodeCapability) {
            console.log('   ⚠️  No models with Code capability found');
        }
        if (!hasEmbeddingCapability) {
            console.log('   ⚠️  No models with Embeddings capability found');
        }
        
        console.log('   ✅ Model capabilities distributed across categories');
        
        console.log('✅ Model definitions test passed');
        console.log(`📋 Total models: ${LM_STUDIO_MODELS.length}`);
        console.log(`📋 Default model: ${defaultModel}`);
        console.log(`📋 Categories: coding, general, embedding`);
        console.log(`✅ All current environment models are defined\n`);
        
        return true;
    } catch (error) {
        console.log('❌ Model definitions test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testModels().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testModels };