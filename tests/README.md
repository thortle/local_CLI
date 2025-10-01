# LM Studio Integration Testing Suite

Testing framework and validation for LM Studio integration into Gemini CLI Masters.

**Project Status**: ✅ Phase 1-4 Complete | ⏳ Phase 5 Implementation Ready

---

## Phase 5: Sandbox Modification - IMPLEMENTATION PLAN

### Decision: Expand Sandbox to Home Directory

**Root Cause**: Sandbox restricts file access to working directory (`process.cwd()`), preventing Copilot-like UX.

**Solution**: Change sandbox root from working directory to home directory for single-user local setup.

### Implementation Steps

#### 1. Code Changes

Modify constructor in each affected tool:

**Files to Update** (in `/gemini-cli-masters-core/dist/src/tools/`):
- `read-file.js`
- `write-file.js`
- `edit.js`
- `ls.js`
- `grep.js`
- `file-discovery.js`
- `read-many-files.js`

**Change** (around line 41 in each constructor):
```javascript
// FROM:
this.rootDirectory = process.cwd();

// TO:
const os = require('os');
this.rootDirectory = os.homedir(); // or '/Users/thortle'
```

#### 2. Testing Validation

Run from `/tests/step5/`:

```bash
# Test 1: Cross-directory access (previously blocked)
gemini-masters "Read /Users/thortle/Desktop/ML/CLI/README.md and summarize"
# Expected: ✅ Works

# Test 2: Home directory files
gemini-masters "Read ~/Documents/somefile.txt"
# Expected: ✅ Works

# Test 3: System files (should still be blocked)
gemini-masters "Read /etc/passwd"
# Expected: ❌ Blocked (outside home)
```

#### 3. Security Boundaries

**Accessible** (within `/Users/thortle/`):
- ✅ All projects and documents
- ✅ User configs (`~/.config`, `~/.gemini`)
- ✅ Downloads, Desktop, Documents

**Protected** (outside home directory):
- ❌ System files (`/System`, `/usr`, `/etc`)
- ❌ Other users (`/Users/otheruser`)
- ❌ Root-level directories

### Rollback Plan

If issues arise, revert to:
```javascript
this.rootDirectory = process.cwd();
```

---

## Quick Reference

### Run All Tests
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/test-runner.js
```

### Phase-Specific Tests
```bash
# Phase 1: Core Infrastructure
node utils/test-runner.js --phase=1

# Phase 2: Configuration
node utils/test-runner.js --phase=2

# Phase 3: CLI Integration
node utils/test-runner.js --phase=3

# Phase 4: CLI Validation
cd step4 && ./quick-cli-test.sh
```

### Detailed Documentation
- **Phase 1-4**: See `/CLI/LM_STUDIO_INTEGRATION_PLAN.md`
- **Phase 4 Debugging**: See `/tests/step4/README.md`
- **Phase 5 Investigation**: See `/tests/step5/README.md`
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

# Step 4 validation
cd step4
./quick-cli-test.sh
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
- **✅ Phase 4**: Tool Usage Investigation & CLI Fix - Complete
  - Models proven tool-aware (90-100% success)
  - CLI timeout issue identified and fixed
  - Telemetry disabled for optimal performance
  - Validation tools in place
- **✅ Full Integration**: All systems operational

**Current Status**: All phases complete and validated. CLI fully operational with LM Studio.

For detailed implementation status and documentation, see:
- `/CLI/LM_STUDIO_INTEGRATION_PLAN.md` - Complete project documentation
- `/CLI/tests/step3/README.md` - CLI integration debugging
- `/CLI/tests/step4/README.md` - Tool investigation & CLI fix