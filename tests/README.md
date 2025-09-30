# LM Studio Integration Testing Suite

This directory contains all test scripts and documentation for validating the LM Studio integration into Gemini CLI Masters.

## 📁 Directory Structure

```
tests/
├── README.md                    # This file
├── step1/                       # Step 1: Core Infrastructure tests
│   ├── test-authtype.js        # AuthType enum validation
│   ├── test-adapter.js         # LM Studio adapter creation
│   ├── test-registry.js        # Adapter registry integration
│   └── test-connection.js      # Connection validation
├── step2/                       # Step 2: Configuration System tests
│   ├── test-models.js          # Model definitions and validation
│   ├── test-config.js          # Configuration integration
│   └── test-env-vars.js        # Environment variable handling
├── step3/                       # Step 3: CLI Integration tests
│   ├── test-commands.js        # CLI command parsing
│   └── test-switching.js       # Provider switching
├── integration/                 # Full integration tests
│   ├── test-full-workflow.js   # End-to-end testing
│   └── test-with-lmstudio.js   # Real LM Studio communication
└── utils/                       # Test utilities
    ├── test-runner.js          # Automated test runner
    └── test-helpers.js         # Common test functions
```

## 🧪 Testing Phases

### Phase 1: Core Infrastructure ✅
**Status**: Completed and Validated

Tests the fundamental components:
- AuthType enum extension
- LM Studio adapter creation
- Registry integration
- Basic connection validation

**Run Phase 1 Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=1
```

### Phase 2: Configuration System 🔄
**Status**: In Development

Tests configuration integration:
- Model definitions
- Environment variables
- Content generator configuration
- Model validation functions

**Run Phase 2 Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=2
```

### Phase 3: CLI Integration ⏳
**Status**: Planned

Tests CLI functionality:
- `/model lmstudio` command
- Provider switching
- Error handling
- Help text integration

**Run Phase 3 Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=3
```

### Phase 4: Full Integration ⏳
**Status**: Planned

Tests complete workflow:
- End-to-end provider switching
- Real LM Studio communication
- Tool calling with LM Studio
- Performance validation

**Run Integration Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --integration
```

## 🚀 Quick Start

### Run All Available Tests
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --all
```

### Run Specific Test
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node step1/test-adapter.js
```

### Validate LM Studio Connection
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-helpers.js --check-lmstudio
```

## 📋 Test Requirements

### Prerequisites
- **Node.js**: Version 20+ (project requirement)
- **LM Studio**: Running locally on port 1234 (for connection tests)
- **Loaded Model**: At least one model loaded in LM Studio (for full tests)

### Environment Setup
```bash
# Optional: Set LM Studio configuration
export LM_STUDIO_BASE_URL="http://127.0.0.1:1234"
export LM_STUDIO_MODEL="your-preferred-model-id"
export LM_STUDIO_API_KEY="lm-studio"

# Navigate to project root
cd /Users/thortle/Desktop/ML/CLI

# Run tests
cd tests && node utils/test-runner.js
```

## 🎯 Testing Strategy

### Unit Tests
- **Isolated Component Testing**: Each adapter, configuration, and utility function
- **Mock Dependencies**: Test without requiring external services
- **Error Scenarios**: Validate error handling and edge cases

### Integration Tests
- **Provider Integration**: Test adapter registration and switching
- **Configuration Integration**: Verify config system works end-to-end
- **CLI Integration**: Validate command parsing and execution

### System Tests
- **Real LM Studio**: Test with actual LM Studio instance
- **Model Communication**: Verify text generation and tool calling
- **Performance**: Validate response times and memory usage

### Regression Tests
- **Existing Functionality**: Ensure we don't break other providers
- **Backward Compatibility**: Verify existing commands still work
- **Error Handling**: Maintain robust error messages

## 📊 Test Results Format

Tests output results in consistent format:

```
🧪 Test: [Test Name]
✅ PASS: [Success Description]
❌ FAIL: [Failure Description]
⚠️  WARN: [Warning Description]
📋 INFO: [Information]
```

### Exit Codes
- `0`: All tests passed
- `1`: One or more tests failed
- `2`: Test setup/configuration error

## 🔧 Test Development Guidelines

### Adding New Tests
1. Create test file in appropriate phase directory
2. Follow naming convention: `test-[component].js`
3. Include descriptive console output
4. Use consistent error handling
5. Update this README with new test description

### Test File Template
```javascript
console.log('🧪 Testing [Component Name]...\n');

async function test[ComponentName]() {
    try {
        console.log('1️⃣ Testing [specific functionality]...');
        // Test implementation
        console.log('✅ [Component] test passed\n');
        return true;
    } catch (error) {
        console.log('❌ [Component] test failed:', error.message);
        return false;
    }
}

test[ComponentName]().then(success => {
    process.exit(success ? 0 : 1);
});
```

## 🐛 Troubleshooting

### Common Issues

**"LM Studio connection failed"**
- Ensure LM Studio is running
- Check port 1234 is available
- Verify at least one model is loaded

**"Module not found"**
- Run from correct directory: `/Users/thortle/Desktop/ML/CLI/tests`
- Check file paths in test scripts
- Verify all dependencies are installed

**"AuthType undefined"**
- Ensure Step 1 implementation is complete
- Check AuthType enum includes USE_LM_STUDIO
- Verify imports are correct

### Debug Mode
Run tests with debug output:
```bash
DEBUG=1 node utils/test-runner.js --phase=1
```

## 📈 Test Coverage Goals

- **Unit Tests**: 100% of new LM Studio components
- **Integration Tests**: All provider switching scenarios
- **Error Handling**: All error paths and edge cases
- **Performance**: Response time and memory benchmarks

## 🔄 Continuous Testing

### Manual Testing Workflow
1. Make code changes
2. Run relevant phase tests
3. Fix any failures
4. Run integration tests
5. Validate with real LM Studio

### Automated Testing (Future)
- Git pre-commit hooks
- CI/CD integration
- Performance regression detection
- Compatibility testing across Node.js versions

---

## 📝 Test Log

### Step 1 Testing Results ✅
**Date**: September 30, 2025  
**Status**: All tests passing  
**Environment**: LM Studio running with 3 models loaded  
**Details**: 
- ✅ **AuthType enum**: USE_LM_STUDIO added as "lm-studio"
- ✅ **Adapter creation**: LMStudioContentGenerator working with 30s timeout
- ✅ **Registry integration**: 'lm-studio' auth type recognized and routed correctly
- ✅ **Connection validation**: Successfully connects to running LM Studio at localhost:1234
- ✅ **Model discovery**: Detected 3 models:
  - mistralai/devstral-small-2507 (coding optimized)
  - text-embedding-nomic-embed-text-v1.5 (embeddings)
  - qwen/qwen3-coder-30b (large coding model)
- ✅ **Error handling**: Robust connection failure handling for offline scenarios
- ✅ **Test duration**: All tests completed in 85ms

**Test Commands Verified:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=1        # ✅ All 4 tests passed
node utils/test-helpers.js                 # ✅ Environment ready
node utils/test-helpers.js --check-lmstudio # ✅ LM Studio connected
node utils/test-runner.js --all            # ✅ Phase 1 complete
```

### Next Phase
**Target**: Step 2 - Configuration System
**Focus**: Model definitions, environment variables, config integration