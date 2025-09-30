# LM Studio Integration Testing Suite

Testing framework and validation for LM Studio integration into Gemini CLI Masters.

## 📁 Directory Structure

```
tests/
├── README.md                    # Testing framework overview (this file)
├── step1/                       # Core Infrastructure tests
│   ├── test-authtype.js        # AuthType enum validation
│   ├── test-adapter.js         # LM Studio adapter creation
│   ├── test-registry.js        # Adapter registry integration
│   └── test-connection.js      # Connection validation
├── step2/                       # Configuration System tests
│   ├── test-models.js          # Model definitions and validation
│   ├── test-config.js          # Configuration integration
│   └── test-env-vars.js        # Environment variable handling
├── step3/                       # CLI Integration tests
│   ├── cli-integration.test.js # CLI integration testing
│   ├── integration-workflow.test.js # Integration workflow testing
│   └── README.md               # Step 3 debugging guide
├── step4/                       # Tool Calling Verification & Debugging
│   ├── README.md               # Phase 4 testing documentation
│   ├── test-api-tool-calling.js       # Direct API tool calling tests
│   ├── test-cli-tool-integration.js   # CLI tool calling integration
│   ├── test-model-optimization.js     # Model-specific optimizations
│   └── test-timeout-handling.js       # Timeout and error handling
├── integration/                 # Full integration tests
│   └── manual-integration-test.js # Manual end-to-end validation
└── utils/                       # Test utilities
    ├── run-tool-tests.js       # Tool calling test suite runner
    ├── test-runner.js          # Automated test runner
    ├── test-helpers.js         # Common test functions
    └── test-lmstudio.js        # LM Studio specific utilities
```

## 🧪 Testing Phases

### Phase 1: Core Infrastructure ✅
Tests fundamental adapter components and registry integration.

**Run Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=1
```

### Phase 2: Configuration System ✅  
Tests model definitions, environment variables, and configuration integration.

**Run Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=2
```

### Phase 3: CLI Integration ✅
Tests CLI commands, authentication flow, and bundle integration.
*See `step3/README.md` for detailed debugging information.*

**Run Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --phase=3
```

### Phase 4: Tool Calling Verification & Debugging 🔄
Tests tool calling functionality, timeout handling, and model optimization.
*See `step4/README.md` for detailed testing and debugging information.*

**Run Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/run-tool-tests.js --all
```

### Full Integration ✅
Tests complete end-to-end workflows and production deployment.

**Run Tests:**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node integration/manual-integration-test.js
```

## 🚀 Quick Test Commands

### Run All Tests
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js --all
```

### Check LM Studio Connection
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-helpers.js --check-lmstudio
```

### Run Individual Phase
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node step1/test-adapter.js
node step2/test-config.js
node step4/test-api-tool-calling.js
```

### Run Step 4 Tool Calling Tests
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/run-tool-tests.js --all
```

## 📋 Test Requirements & Setup

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

# Navigate to tests directory
cd /Users/thortle/Desktop/ML/CLI/tests
```

## 🎯 Testing Strategy

### Test Categories
- **Unit Tests**: Isolated component testing (steps 1-2)
- **Integration Tests**: End-to-end workflow validation (step 3 + integration)
- **System Tests**: Real LM Studio communication and performance

### Test Principles
- **Isolated Testing**: Each component tested independently
- **Progressive Validation**: Build from core components to full integration
- **Error Scenarios**: Comprehensive offline/online scenario coverage
- **Performance Validation**: Response times and resource usage

## 📊 Test Output Format

All tests use consistent output format:
```
🧪 Test: [Test Name]
✅ PASS: [Success Description]
❌ FAIL: [Failure Description]
⚠️  WARN: [Warning Description]
📋 INFO: [Information]
```

**Exit Codes**: `0` = Pass, `1` = Fail, `2` = Setup Error

## � Common Troubleshooting

### LM Studio Connection Issues
```bash
# Verify LM Studio is running
curl http://127.0.0.1:1234/v1/models
# Expected: JSON response with models

# Check connection helper
node utils/test-helpers.js --check-lmstudio
```

### Test Environment Issues
```bash
# Verify correct directory
pwd
# Expected: /Users/thortle/Desktop/ML/CLI/tests

# Check Node.js version
node --version
# Expected: v20+ or v24+
```

### Bundle/Integration Issues
```bash
# Test global installation
which gemini-masters
# Expected: /opt/homebrew/bin/gemini-masters

# Verify bundle modifications
node integration/manual-integration-test.js
```

## � Test Development Guidelines

### Adding New Tests
1. **Choose appropriate phase directory** (step1, step2, step3, integration)
2. **Follow naming convention**: `test-[component].js`
3. **Use consistent output format** (🧪, ✅, ❌, ⚠️, 📋)
4. **Include error handling** for all scenarios
5. **Update documentation** when adding new test categories

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

## 📈 Test Coverage Status

- **✅ Phase 1**: Core Infrastructure - Complete
- **✅ Phase 2**: Configuration System - Complete
- **✅ Phase 3**: CLI Integration - Complete (see `step3/README.md` for debugging)
- ** Phase 4**: Full Integration

For detailed implementation status and next development phases, see:
- `/CLI/LM_STUDIO_INTEGRATION_PLAN.md` - Complete project documentation
- `/CLI/tests/step3/README.md` - Step 3 specific debugging guide