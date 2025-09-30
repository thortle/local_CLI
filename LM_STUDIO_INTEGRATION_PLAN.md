# LM Studio Integration Plan for Gemini CLI Masters

## 📋 Project Overview

This document outlines the implementation plan for adding **LM Studio** support to the Gemini CLI Masters project, enabling users to leverage local MLX-optimized models on Apple Silicon hardware alongside the existing Ollama support.

**Goal**: Add LM Studio as a new provider option that users can select with `/model lmstudio`, utilizing the same OpenAI-compatible API endpoints but with LM Studio-specific optimizations and default configurations.

## 🏗️ Current Architecture Analysis

### Existing Provider System
The CLI currently supports the following providers through a sophisticated adapter pattern:

1. **Google Gemini** (original) - Default provider
2. **Azure OpenAI** - Enterprise OpenAI via Azure
3. **OpenAI Compatible Models** - Direct OpenAI API
4. **Anthropic Claude** - Claude models
5. **Local LLM (Ollama)** - Local models via Ollama

### Current Authentication Types
```javascript
enum AuthType {
    LOGIN_WITH_GOOGLE = "oauth-personal",
    USE_GEMINI = "gemini-api-key", 
    USE_VERTEX_AI = "vertex-ai",
    USE_OPENAI_COMPATIBLE = "openai-compatible",
    USE_ANTHROPIC = "anthropic",
    USE_LOCAL_LLM = "local-llm",
    USE_AZURE = "azure"
}
```

### Current Model Switch Command
```bash
/model [local|claude|openai]
```

### Key Files and Components
- **Adapters**: `gemini-cli-masters-core/dist/src/adapters/`
  - `localLlmContentGenerator.js` (Ollama)
  - `openaiCompatibleContentGenerator.js` (Base OpenAI)
  - `anthropicContentGenerator.js`
  - `azureContentGenerator.js`
- **Configuration**: `gemini-cli-masters-core/dist/src/config/`
  - `config.js` - Main configuration management
  - `models.js` - Model definitions and validation
- **Core**: `gemini-cli-masters-core/dist/src/core/`
  - `contentGenerator.js` - Provider factory and auth logic
- **CLI Bundle**: `gemini-cli-masters/bundle/gemini.js` - Command handling

## 🎯 Implementation Plan

### Phase 1: Add LM Studio as New AuthType

#### 1.1 Extend AuthType Enum
**File**: `gemini-cli-masters-core/dist/src/core/contentGenerator.js`

```javascript
export var AuthType;
(function (AuthType) {
    AuthType["LOGIN_WITH_GOOGLE"] = "oauth-personal";
    AuthType["USE_GEMINI"] = "gemini-api-key";
    AuthType["USE_VERTEX_AI"] = "vertex-ai";
    AuthType["USE_OPENAI_COMPATIBLE"] = "openai-compatible";
    AuthType["USE_ANTHROPIC"] = "anthropic";
    AuthType["USE_LOCAL_LLM"] = "local-llm";
    AuthType["USE_LM_STUDIO"] = "lm-studio";  // NEW
    AuthType["USE_AZURE"] = "azure";
})(AuthType || (AuthType = {}));
```

#### 1.2 Add User-Agent for LM Studio
**File**: `gemini-cli-masters-core/dist/src/core/contentGenerator.js`

```javascript
function getProviderSpecificUserAgent(authType, version) {
    // ... existing cases ...
    case AuthType.USE_LM_STUDIO:
        return `AI-CLI-LMStudio/${version} (${platform}; ${arch})`;
    // ... rest of cases ...
}
```

### Phase 2: Create LM Studio Adapter

#### 2.1 Create LMStudioContentGenerator
**File**: `gemini-cli-masters-core/dist/src/adapters/lmStudioContentGenerator.js`

```javascript
/**
 * LM Studio content generator optimized for MLX models on Apple Silicon
 * Uses OpenAI-compatible API endpoints at http://127.0.0.1:1234
 */
export class LMStudioContentGenerator extends OpenAICompatibleContentGenerator {
    constructor(config) {
        // Set LM Studio-specific defaults
        const lmStudioConfig = {
            ...config,
            baseUrl: config.baseUrl || 'http://127.0.0.1:1234',
            apiKey: config.apiKey || 'lm-studio', // LM Studio doesn't require real API key
            timeout: config.timeout || 30000, // 30s timeout for local inference
        };
        super(lmStudioConfig);
    }

    async generateContent(request) {
        // Add LM Studio-specific request preprocessing
        const openAIRequest = this.convertToOpenAIFormat(request);
        
        // LM Studio optimizations for MLX
        if (openAIRequest.stream === undefined) {
            openAIRequest.stream = false; // Default to non-streaming for better compatibility
        }
        
        // Add MLX-specific parameters if available
        if (this.config.temperature === undefined) {
            openAIRequest.temperature = 0.7; // Good default for MLX models
        }
        
        return super.generateContent(request);
    }

    async validateConnection() {
        try {
            const response = await fetch(`${this.config.baseUrl}/v1/models`);
            if (!response.ok) {
                throw new Error(`LM Studio not reachable: ${response.status}`);
            }
            const models = await response.json();
            return models.data?.length > 0;
        } catch (error) {
            throw new Error(`LM Studio connection failed: ${error.message}`);
        }
    }
}
```

#### 2.2 Update Adapter Index
**File**: `gemini-cli-masters-core/dist/src/adapters/index.js`

```javascript
import { LMStudioContentGenerator } from './lmStudioContentGenerator.js';

export function createCustomContentGenerator(authType, config) {
    switch (authType) {
        // ... existing cases ...
        case 'lm-studio':
            return new LMStudioContentGenerator(config);
        // ... rest of cases ...
    }
}

// Export the new generator
export { LMStudioContentGenerator };
```

### Phase 3: Configuration Integration

#### 3.1 Add LM Studio Model Definitions
**File**: `gemini-cli-masters-core/dist/src/config/models.js`

```javascript
// LM Studio model definitions for MLX-optimized models
export const LM_STUDIO_MODELS = [
    {
        id: 'mlx-community/Llama-3.2-3B-Instruct-4bit',
        name: 'Llama 3.2 3B Instruct (MLX)',
        description: 'Fast and efficient Llama 3.2 3B model optimized for MLX',
        capabilities: ['Text', 'Code', 'Instruct'],
        isDefault: true,
        optimized: 'mlx'
    },
    {
        id: 'mlx-community/Llama-3.1-8B-Instruct-4bit',
        name: 'Llama 3.1 8B Instruct (MLX)',
        description: 'Balanced Llama 3.1 8B model with MLX optimization',
        capabilities: ['Text', 'Code', 'Analysis', 'Instruct'],
        optimized: 'mlx'
    },
    {
        id: 'mlx-community/Qwen2.5-7B-Instruct-4bit',
        name: 'Qwen2.5 7B Instruct (MLX)',
        description: 'High-performance Qwen2.5 7B model for Apple Silicon',
        capabilities: ['Text', 'Code', 'Multilingual', 'Instruct'],
        optimized: 'mlx'
    },
    {
        id: 'mlx-community/DeepSeek-Coder-V2-Lite-Instruct-4bit',
        name: 'DeepSeek Coder V2 Lite (MLX)',
        description: 'Specialized coding model optimized for MLX',
        capabilities: ['Code', 'Programming', 'Analysis'],
        optimized: 'mlx'
    }
];

export const getDefaultLMStudioModel = () => {
    const defaultModel = LM_STUDIO_MODELS.find(model => model.isDefault);
    return defaultModel?.id || 'mlx-community/Llama-3.2-3B-Instruct-4bit';
};

export const getLMStudioModelInfo = (modelId) => 
    LM_STUDIO_MODELS.find(model => model.id === modelId);

export const validateLMStudioModel = (modelId) => 
    LM_STUDIO_MODELS.some(model => model.id === modelId);
```

#### 3.2 Update ContentGenerator Configuration
**File**: `gemini-cli-masters-core/dist/src/core/contentGenerator.js`

```javascript
import { 
    DEFAULT_GEMINI_MODEL, 
    getDefaultAnthropicModel, 
    validateAnthropicModel,
    getDefaultLMStudioModel,  // NEW
    validateLMStudioModel     // NEW
} from '../config/models.js';

export async function createContentGeneratorConfig(model, authType, config) {
    // ... existing code ...
    
    const lmStudioApiKey = getValue('LM_STUDIO_API_KEY', 'lmStudioApiKey');
    const lmStudioBaseUrl = getValue('LM_STUDIO_BASE_URL', 'lmStudioBaseUrl');
    const lmStudioModel = getValue('LM_STUDIO_MODEL', 'lmStudioModel');
    
    // ... existing auth type handling ...
    
    // LM Studio (local MLX models)
    if (authType === AuthType.USE_LM_STUDIO) {
        contentGeneratorConfig.apiKey = lmStudioApiKey || 'lm-studio';
        contentGeneratorConfig.baseUrl = lmStudioBaseUrl || 'http://127.0.0.1:1234';
        
        // Use user-specified model or validate against LM Studio models
        if (lmStudioModel) {
            contentGeneratorConfig.model = lmStudioModel;
        } else if (effectiveModel && validateLMStudioModel(effectiveModel)) {
            contentGeneratorConfig.model = effectiveModel;
        } else {
            contentGeneratorConfig.model = getDefaultLMStudioModel();
        }
        
        return contentGeneratorConfig;
    }
    
    // ... rest of function ...
}
```

### Phase 4: CLI Command Updates

#### 4.1 Update Model Switch Command Handler
**File**: `gemini-cli-masters/bundle/gemini.js` (bundled CLI)

Update the `/model` command to include `lmstudio`:

```javascript
// Current: /model [local|claude|openai]
// New:     /model [local|claude|openai|lmstudio]

const modelSwitchHelp = "Usage: /model [local|claude|openai|lmstudio]\n\n" +
    "Available options:\n" +
    "  - local: Switch to Local LLM (Ollama)\n" +
    "  - claude: Switch to Anthropic Claude\n" +
    "  - openai: Switch to OpenAI Compatible API\n" +
    "  - lmstudio: Switch to LM Studio (MLX-optimized models)";

// Add case for 'lmstudio'
case 'lmstudio':
    await switchToProvider('lm-studio', 'LM Studio');
    break;
```

#### 4.2 Provider Switch Function
Add LM Studio case to the provider switching logic:

```javascript
async function switchToProvider(authType, displayName) {
    switch (authType) {
        // ... existing cases ...
        case 'lm-studio':
            return await switchToLMStudio();
        // ... rest of cases ...
    }
}

async function switchToLMStudio() {
    // Validate LM Studio connection
    try {
        const response = await fetch('http://127.0.0.1:1234/v1/models');
        if (!response.ok) {
            throw new Error('LM Studio not reachable');
        }
        
        // Switch to LM Studio provider
        config.setAuthType('lm-studio');
        config.setModel(getDefaultLMStudioModel());
        
        return {
            content: "✅ Switched to LM Studio (MLX-optimized models)\n" +
                    "Default model: " + getDefaultLMStudioModel() + "\n" +
                    "Endpoint: http://127.0.0.1:1234\n\n" +
                    "Make sure LM Studio is running with a loaded model."
        };
    } catch (error) {
        return {
            content: "❌ Failed to connect to LM Studio\n\n" +
                    "Please ensure:\n" +
                    "1. LM Studio is running\n" +
                    "2. A model is loaded\n" +
                    "3. Local server is enabled on port 1234\n\n" +
                    `Error: ${error.message}`
        };
    }
}
```

### Phase 5: Environment Configuration

#### 5.1 Environment Variables
Add support for LM Studio-specific environment variables:

```bash
# LM Studio Configuration
export LM_STUDIO_BASE_URL="http://127.0.0.1:1234"  # Default LM Studio endpoint
export LM_STUDIO_API_KEY="lm-studio"                # Optional API key
export LM_STUDIO_MODEL="mlx-community/Llama-3.2-3B-Instruct-4bit"  # Default model
```

#### 5.2 Configuration File Support
**File**: Configuration system updates

```javascript
// Add to config.js for persistent settings
const lmStudioSettings = {
    baseUrl: 'http://127.0.0.1:1234',
    defaultModel: 'mlx-community/Llama-3.2-3B-Instruct-4bit',
    timeout: 30000,
    enableStreamingMode: false  // Better compatibility with MLX
};
```

### Phase 6: Enhanced Features

#### 6.1 Model Discovery
Add automatic model discovery from LM Studio:

```javascript
async function discoverLMStudioModels() {
    try {
        const response = await fetch('http://127.0.0.1:1234/v1/models');
        const data = await response.json();
        return data.data?.map(model => ({
            id: model.id,
            name: model.id,
            loaded: true
        })) || [];
    } catch (error) {
        console.warn('Could not discover LM Studio models:', error.message);
        return [];
    }
}
```

#### 6.2 Health Check Integration
Add LM Studio health checking:

```javascript
async function checkLMStudioHealth() {
    try {
        const response = await fetch('http://127.0.0.1:1234/health');
        return response.ok;
    } catch {
        return false;
    }
}
```

#### 6.3 MLX Optimization Hints
Add MLX-specific optimizations:

```javascript
const mlxOptimizations = {
    // Recommended settings for Apple Silicon MLX models
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 2048,
    stream: false,  // Non-streaming often faster on MLX
    // Add MLX-specific parameters when available
};
```

## 🔧 Implementation Steps

### Step 1: Core Infrastructure (Day 1)
1. ✅ **Research and analysis** - Understand current architecture
2. **Add AuthType enum** - Extend `USE_LM_STUDIO` 
3. **Create base adapter** - `LMStudioContentGenerator`
4. **Update adapter index** - Register new provider

### Step 2: Configuration System (Day 2)
1. **Add model definitions** - LM Studio model catalog
2. **Update contentGenerator** - Add LM Studio config logic
3. **Add environment variable support** - LM Studio settings
4. **Test basic connectivity** - Validate adapter works

### Step 3: CLI Integration (Day 3)
1. **Update command parser** - Add `lmstudio` to `/model` command
2. **Add provider switching** - Implement LM Studio switch logic
3. **Add connection validation** - Health check integration
4. **Update help text** - Document new command option

### Step 4: Enhanced Features (Day 4)
1. **Model discovery** - Auto-detect loaded models
2. **MLX optimizations** - Apple Silicon specific tuning
3. **Error handling** - Comprehensive error messages
4. **Validation logic** - Model and connection validation

### Step 5: Testing & Documentation (Day 5)
1. **Unit tests** - Test adapter and configuration
2. **Integration tests** - End-to-end testing
3. **Documentation updates** - README and help text
4. **Performance validation** - MLX optimization verification

## 🧪 Testing Strategy

### Unit Tests
- **LMStudioContentGenerator** - Adapter functionality
- **Model validation** - LM Studio model catalog
- **Configuration** - Environment variable handling
- **Command parsing** - `/model lmstudio` command

### Integration Tests  
- **Provider switching** - Full workflow from `/model lmstudio`
- **Connection handling** - LM Studio offline/online scenarios
- **Model switching** - Different MLX models
- **Error scenarios** - Network failures, invalid models

### Manual Testing Scenarios
1. **Fresh installation** - LM Studio not running
2. **Model loading** - Switch between different MLX models
3. **Performance testing** - Compare vs Ollama on M1 Pro 32GB
4. **Tool integration** - Ensure all CLI tools work with LM Studio
5. **Multi-session** - Model persistence across sessions

## 🎯 Apple Silicon M1 Pro Optimization

### MLX-Specific Considerations
- **Model Format**: Prioritize MLX-quantized models (4-bit, 8-bit)
- **Memory Management**: Optimize for 32GB unified memory
- **Performance**: Leverage Metal Performance Shaders
- **Model Size**: Recommend models that fit comfortably in 32GB

### Recommended Models for M1 Pro 32GB
1. **Llama 3.2 3B** - Fast inference, good for general tasks
2. **Llama 3.1 8B** - Balanced performance and capability  
3. **Qwen2.5 7B** - Excellent multilingual support
4. **DeepSeek Coder V2 Lite** - Specialized for coding tasks
5. **Phi-3.5 Mini** - Microsoft's efficient 3.8B model

### Performance Expectations
- **3B models**: ~50-100 tokens/second
- **7-8B models**: ~20-40 tokens/second  
- **Memory usage**: ~4-12GB depending on model size
- **Loading time**: 5-15 seconds for model initialization

## 🚀 User Experience

### Command Flow
```bash
# User starts CLI
gemini-masters

# Switch to LM Studio
> /model lmstudio
✅ Switched to LM Studio (MLX-optimized models)
Default model: mlx-community/Llama-3.2-3B-Instruct-4bit
Endpoint: http://127.0.0.1:1234

# Automatic validation
Make sure LM Studio is running with a loaded model.

# Continue with regular CLI usage
> Help me optimize this Python function for performance
```

### Error Handling
```bash
> /model lmstudio
❌ Failed to connect to LM Studio

Please ensure:
1. LM Studio is running
2. A model is loaded  
3. Local server is enabled on port 1234

Error: Connection refused
```

## 📚 Documentation Updates

### README.md Updates
```markdown
## AI Provider Support

### Supported Providers
- **Google Gemini** (original) - Default provider with Gemini 2.5 Pro/Flash
- **Azure OpenAI** - Enterprise-grade OpenAI models via Azure
- **OpenAI Compatible Models** - Including GPT-4o and other OpenAI models
- **Anthropic Claude Models** - Claude 3.5 Sonnet and other Claude variants
- **Local LLM (Ollama)** - Local model execution with tool support
- **LM Studio** - MLX-optimized models for Apple Silicon (NEW)

### Model Switching
Switch models on-the-fly using `/model` command:
- `/model local` - Switch to Ollama
- `/model claude` - Switch to Anthropic Claude
- `/model openai` - Switch to OpenAI
- `/model lmstudio` - Switch to LM Studio (MLX models)
```

### Configuration Documentation
```markdown
## LM Studio Configuration

### Environment Variables
```bash
export LM_STUDIO_BASE_URL="http://127.0.0.1:1234"
export LM_STUDIO_MODEL="mlx-community/Llama-3.2-3B-Instruct-4bit"
```

### Requirements
- LM Studio installed and running
- MLX-compatible model loaded
- Local server enabled on port 1234 (default)
```

## 🔍 Validation Criteria

### Technical Validation
- [ ] LM Studio adapter successfully extends OpenAI compatible generator
- [ ] `/model lmstudio` command works and switches provider
- [ ] Environment variables are properly configured and used
- [ ] MLX model catalog is properly defined and validated
- [ ] Connection validation works for online/offline scenarios
- [ ] All CLI tools work correctly with LM Studio provider

### Performance Validation
- [ ] Model loading time acceptable (<30 seconds)
- [ ] Inference speed competitive with Ollama
- [ ] Memory usage appropriate for M1 Pro 32GB
- [ ] Token generation rate meets expectations
- [ ] Tool calling functionality preserved

### User Experience Validation
- [ ] Clear error messages when LM Studio unavailable
- [ ] Smooth switching between providers
- [ ] Model discovery works automatically
- [ ] Help documentation is clear and complete
- [ ] Configuration is straightforward

## 🏁 Success Metrics

### Functional Goals
- ✅ LM Studio provider fully integrated
- ✅ Command switching works (`/model lmstudio`)
- ✅ MLX models properly supported
- ✅ Performance competitive with Ollama
- ✅ All CLI tools compatible

### Performance Goals  
- **Model loading**: <30 seconds
- **Token generation**: >20 tokens/second (7B models)
- **Memory efficiency**: <50% of 32GB for 8B models
- **Tool calling latency**: <2 seconds per tool call

### User Experience Goals
- **Setup time**: <5 minutes from LM Studio install to working CLI
- **Error clarity**: 100% of error scenarios provide actionable feedback
- **Documentation completeness**: All features documented with examples

## 🔄 Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Model Management Integration** - Direct model download from CLI
2. **Performance Monitoring** - Real-time inference metrics
3. **Advanced MLX Optimizations** - Model-specific tuning
4. **Multi-Model Support** - Load multiple models simultaneously
5. **Custom Model Support** - User-trained MLX models

### Integration Opportunities
1. **Hugging Face Hub** - Direct model discovery and download
2. **MLX Community** - Integration with MLX model repositories  
3. **Apple ML Frameworks** - Core ML integration possibilities
4. **Custom Training** - LoRA/fine-tuning workflow integration

---

## 📋 Implementation Checklist

- [ ] **Core Infrastructure**
  - [ ] Add `USE_LM_STUDIO` AuthType
  - [ ] Create `LMStudioContentGenerator` adapter
  - [ ] Update adapter registry
  - [ ] Add user-agent for LM Studio

- [ ] **Configuration System**
  - [ ] Define LM Studio model catalog
  - [ ] Add environment variable support
  - [ ] Update content generator config logic
  - [ ] Add model validation functions

- [ ] **CLI Integration**
  - [ ] Update `/model` command parser
  - [ ] Add `lmstudio` switch case
  - [ ] Implement provider switching logic
  - [ ] Add connection validation

- [ ] **Enhanced Features**
  - [ ] Model discovery from LM Studio API
  - [ ] Health check integration
  - [ ] MLX-specific optimizations
  - [ ] Comprehensive error handling

- [ ] **Testing**
  - [ ] Unit tests for adapter
  - [ ] Integration tests for CLI
  - [ ] Manual testing scenarios
  - [ ] Performance validation

- [ ] **Documentation**
  - [ ] Update README.md
  - [ ] Add configuration guide
  - [ ] Update help text
  - [ ] Create troubleshooting guide

---

**Timeline**: 5 days for full implementation and testing
**Priority**: High - Enables MLX optimization for Apple Silicon users
**Dependencies**: LM Studio running locally, MLX-compatible models available
**Risk Level**: Low - Extends existing OpenAI-compatible pattern