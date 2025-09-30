console.log('🧪 Testing AuthType Enum Integration...\n');

async function testAuthType() {
    try {
        console.log('1️⃣ Testing AuthType enum import...');
        const { AuthType } = await import('../../gemini-cli-masters-core/dist/src/core/contentGenerator.js');
        
        console.log('2️⃣ Verifying USE_LM_STUDIO exists...');
        if (!AuthType.USE_LM_STUDIO) {
            throw new Error('USE_LM_STUDIO not found in AuthType enum');
        }
        
        console.log('3️⃣ Checking enum value...');
        if (AuthType.USE_LM_STUDIO !== 'lm-studio') {
            throw new Error(`Expected 'lm-studio', got '${AuthType.USE_LM_STUDIO}'`);
        }
        
        console.log('4️⃣ Verifying all AuthTypes...');
        const expectedTypes = [
            'LOGIN_WITH_GOOGLE',
            'USE_GEMINI', 
            'USE_VERTEX_AI',
            'USE_OPENAI_COMPATIBLE',
            'USE_ANTHROPIC',
            'USE_LOCAL_LLM',
            'USE_LM_STUDIO',
            'USE_AZURE'
        ];
        
        const actualTypes = Object.keys(AuthType);
        const missing = expectedTypes.filter(type => !actualTypes.includes(type));
        
        if (missing.length > 0) {
            throw new Error(`Missing AuthTypes: ${missing.join(', ')}`);
        }
        
        console.log('✅ AuthType enum test passed');
        console.log(`📋 Available types: ${actualTypes.join(', ')}`);
        console.log(`✅ USE_LM_STUDIO = "${AuthType.USE_LM_STUDIO}"\n`);
        
        return true;
    } catch (error) {
        console.log('❌ AuthType test failed:', error.message);
        return false;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testAuthType().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export { testAuthType };