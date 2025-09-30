# Step 3: CLI Integration - Debugging Guide

## 🎯 Step 3 Focus: CLI Integration & Authentication Flow

This step implements the CLI integration for LM Studio, including:
- `/model lmstudio` command implementation
- Authentication method selection
- Provider switching logic
- Bundle modification and deployment

## 🧪 Test Files

### cli-integration.test.js
Tests CLI command functionality:
- `/model lmstudio` command parsing and execution
- Provider switching validation
- Error handling for offline scenarios
- Help text integration verification

### integration-workflow.test.js  
Tests end-to-end workflows:
- Authentication flow completion
- Model switching persistence
- Configuration integration
- User experience validation

## 🔧 Manual Testing Workflow

### Prerequisites
```bash
# Ensure LM Studio is running
curl http://127.0.0.1:1234/v1/models
# Should return model list, not connection error

# Check global installation
which gemini-masters
# Should point to: /opt/homebrew/bin/gemini-masters
```

### Authentication Flow Testing
```bash
# Test 1: Direct LM Studio Authentication
gemini-masters
# → Select "LM Studio" from menu
# → Press Enter when prompted
# → Should access chat interface

# Test 2: Model Switching  
gemini-masters
# → Authenticate with any provider
# → Use: /model lmstudio
# → Should switch successfully
```

### Command Testing
```bash
# Test help integration
gemini-masters --help | grep lmstudio
# Should show lm-studio in auth options

# Test model command
echo "/model lmstudio" | gemini-masters
# Should attempt LM Studio connection
```

## 🐛 Common Issues & Debugging

### Issue: "LM Studio not available"
**Symptoms**: Command fails with connection error
**Debugging**:
```bash
# Check LM Studio server
curl http://127.0.0.1:1234/v1/models
# Expected: JSON response with models
# Problem: Connection refused or 404

# Check LM Studio settings
# → Ensure "Local Server" is enabled
# → Verify port 1234 is configured
# → Confirm at least one model is loaded
```

### Issue: Authentication menu doesn't show Enter prompt
**Symptoms**: "Press Enter to continue" doesn't respond
**Debugging**:
```bash
# Check bundle modification
grep -n "key.return" /Users/thortle/Desktop/ML/CLI/gemini-cli-masters/bundle/gemini.js
# Expected: Found Enter key handler
# Problem: Bundle not properly modified

# Verify AuthType integration
grep -n "USE_LM_STUDIO" /Users/thortle/Desktop/ML/CLI/gemini-cli-masters/bundle/gemini.js
# Expected: Found LM Studio auth type
```

### Issue: Global command uses old bundle
**Symptoms**: Changes not reflected in `gemini-masters` command
**Debugging**:
```bash
# Check symlink
ls -la /opt/homebrew/bin/gemini-masters
# Expected: Points to local bundle
# Problem: Still points to global installation

# Verify bundle modification date
stat /Users/thortle/Desktop/ML/CLI/gemini-cli-masters/bundle/gemini.js
# Should show recent modification time
```

## 🔍 Key Implementation Points

### Bundle Modifications Required
1. **AuthType Enum**: `USE_LM_STUDIO = "lm-studio"`
2. **Enter Key Handler**: `key.return` in `use_input_default`
3. **Model Command**: `/model lmstudio` case handler
4. **Configuration**: LM Studio case in `getFieldsForAuthType`

### Critical Files
- `bundle/gemini.js` - Main bundle (266k+ lines)
- Global symlink at `/opt/homebrew/bin/gemini-masters`

### Validation Commands
```bash
# Test integration
cd /Users/thortle/Desktop/ML/CLI/tests
node integration/manual-integration-test.js

# Test connection
cd /Users/thortle/Desktop/ML/CLI/tests/utils  
node test-helpers.js --check-lmstudio
```

## ✅ Step 3 Completion Status

**Authentication Bug Fixed**: Added Enter key handler to authentication flow
**CLI Integration Complete**: `/model lmstudio` command fully functional  
**Global Deployment**: Modified bundle successfully deployed
**End-to-End Validated**: Both authentication paths working

For complete project status, see `/CLI/tests/README.md` and `/CLI/LM_STUDIO_INTEGRATION_PLAN.md`.
