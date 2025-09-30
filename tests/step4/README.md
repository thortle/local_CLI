# Step 4: Tool Calling Verification & Debugging

## 🎯 Phase 4 Overview

**Status**: **IN PROGRESS** - September 30, 2025  
**Focus**: Validate and optimize tool calling functionality with LM Studio integration

This phase addresses critical tool calling issues identified with `mistralai/devstral-small-2507` and other tool-enabled models, including stalling behavior and timeout problems.

## 📁 Test Files Overview

```
step4/
├── README.md                      # This documentation file
├── test-api-tool-calling.js       # Direct LM Studio API tool calling validation
├── test-cli-tool-integration.js   # CLI tool calling integration testing
├── test-model-optimization.js     # Model-specific optimization testing
└── test-timeout-handling.js       # Timeout and error handling validation
```

## 🔍 Key Issues Being Investigated

### 1. **Tool Calling Stalls**
**Problem**: Model appears to hang indefinitely when given tool-enabled prompts  
**Symptoms**: 
- No response after 30+ seconds
- High CPU usage in LM Studio
- No error messages or timeout handling

**Test Coverage**: `test-api-tool-calling.js`, `test-timeout-handling.js`

### 2. **Function Calling Format Compatibility**
**Problem**: Potential mismatch between Gemini CLI tool format and LM Studio expectations  
**Symptoms**:
- Tools not being called despite clear instructions
- Model responds with text instead of function calls
- Invalid tool call format responses

**Test Coverage**: `test-api-tool-calling.js`, `test-cli-tool-integration.js`

### 3. **CLI Integration Issues**
**Problem**: Tool calling may work via API but fail through CLI interface  
**Symptoms**:
- Direct API calls succeed but CLI tool usage fails
- Inconsistent behavior between `/model lmstudio` and direct auth
- Tool calling works with other providers but not LM Studio

**Test Coverage**: `test-cli-tool-integration.js`

### 4. **Model-Specific Configuration**
**Problem**: `mistralai/devstral-small-2507` may require specific parameters for optimal tool calling  
**Symptoms**:
- Inconsistent tool calling performance
- Different behavior with different temperature/token settings
- Model-specific optimization needed

**Test Coverage**: `test-model-optimization.js`

## 🧪 Testing Strategy

### **Phase 4.1: API-Level Validation**
**File**: `test-api-tool-calling.js`  
**Purpose**: Direct LM Studio API tool calling validation

**Test Scenarios**:
- Simple tool calling (no parameters)
- Complex tool calling (with parameters)
- Multiple tool calling in single request
- Tool calling with different models
- Invalid tool format handling
- Timeout and error scenarios

**Expected Results**:
- ✅ Tool calls complete within 15 seconds
- ✅ Proper JSON format in tool_calls response
- ✅ Correct function name and argument extraction
- ✅ Appropriate finish_reason ('tool_calls')

### **Phase 4.2: CLI Integration Testing**
**File**: `test-cli-tool-integration.js`  
**Purpose**: Tool calling through Gemini CLI interface

**Test Scenarios**:
- CLI tool calling with `/model lmstudio`
- Authentication flow with tool calling
- Built-in tools (read-file, ls, etc.) with LM Studio
- Error propagation from API to CLI
- Real-world tool calling workflows

**Expected Results**:
- ✅ CLI tool calling works seamlessly
- ✅ Built-in tools function with LM Studio
- ✅ Proper error messages for tool failures
- ✅ Consistent behavior across authentication methods

### **Phase 4.3: Model Optimization**
**File**: `test-model-optimization.js`  
**Purpose**: Optimize parameters for `mistralai/devstral-small-2507`

**Test Scenarios**:
- Temperature optimization (0.1, 0.3, 0.7)
- Max tokens configuration (50, 150, 500)
- Tool choice settings (auto, required, specific)
- Stream vs non-stream responses
- Context length and tool calling interaction

**Expected Results**:
- ✅ Optimal parameter set identified
- ✅ Consistent tool calling performance
- ✅ No stalling with optimized settings
- ✅ Model-specific configuration documented

### **Phase 4.4: Timeout and Error Handling**
**File**: `test-timeout-handling.js`  
**Purpose**: Robust timeout and error handling validation

**Test Scenarios**:
- Request timeout handling (15s, 30s, 60s)
- Model unavailable scenarios
- Invalid tool format responses
- Network interruption during tool calling
- Graceful degradation strategies

**Expected Results**:
- ✅ Proper timeout handling implemented
- ✅ Clear error messages for all failure modes
- ✅ Graceful degradation when tool calling fails
- ✅ No hanging requests or resource leaks

## 🚀 Running Step 4 Tests

### **Individual Test Execution**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests

# API-level tool calling validation
node step4/test-api-tool-calling.js

# CLI integration testing
node step4/test-cli-tool-integration.js

# Model optimization testing
node step4/test-model-optimization.js

# Timeout handling validation
node step4/test-timeout-handling.js
```

### **Complete Step 4 Test Suite**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/run-tool-tests.js --step=4
```

### **All Tool Calling Tests**
```bash
cd /Users/thortle/Desktop/ML/CLI/tests
node utils/run-tool-tests.js --all
```

## 📋 Prerequisites

### **Environment Requirements**
- **LM Studio**: Running on `http://127.0.0.1:1234`
- **Model**: `mistralai/devstral-small-2507` loaded and active
- **CLI**: `gemini-masters` installed globally
- **Node.js**: Version 20+ 

### **Verification Commands**
```bash
# Check LM Studio connection
curl -s http://127.0.0.1:1234/v1/models | jq '.data[].id'

# Verify CLI installation
which gemini-masters

# Check Node.js version  
node --version
```

### **Environment Variables**
```bash
export LM_STUDIO_BASE_URL="http://127.0.0.1:1234/v1"
export LM_STUDIO_MODEL="mistralai/devstral-small-2507"
export LM_STUDIO_API_KEY="lm-studio"
```

## 🔧 Debugging Guidelines

### **Tool Calling Stall Investigation**
1. **Monitor LM Studio logs** for error messages
2. **Check CPU/memory usage** during stalled requests
3. **Test with simpler tool definitions** to isolate complexity issues
4. **Verify tool calling format** matches OpenAI specification
5. **Test with different models** to identify model-specific issues

### **Format Compatibility Issues**
1. **Compare tool formats** with working OpenAI examples
2. **Validate JSON schema** of tool definitions
3. **Test parameter extraction** with various argument types
4. **Check function naming conventions** for compatibility

### **Performance Optimization**
1. **Benchmark response times** with different parameter sets
2. **Monitor token usage** and context efficiency
3. **Test streaming vs non-streaming** responses
4. **Analyze tool calling accuracy** vs speed trade-offs

## 📊 Success Criteria

### **Functional Success**
- ✅ No tool calling stalls or timeouts
- ✅ Consistent tool calling through CLI interface
- ✅ Proper error handling and user feedback
- ✅ Tool calling works with all built-in Gemini tools

### **Performance Success**
- ✅ Tool calling responses < 15 seconds (simple tools)
- ✅ Complex tool calling < 30 seconds
- ✅ No memory leaks during extended use
- ✅ Reliable timeout and error recovery

### **Quality Success**
- ✅ Comprehensive test coverage
- ✅ Clear troubleshooting documentation
- ✅ Model-specific optimization guide
- ✅ Production-ready error handling

## 📈 Expected Outcomes

**After Step 4 completion**:
- 🎯 **Tool calling reliability**: 99%+ success rate with optimal parameters
- 🎯 **Response performance**: Sub-15 second tool calling for standard operations
- 🎯 **Error handling**: Comprehensive timeout and error recovery
- 🎯 **User experience**: Seamless tool calling through CLI interface
- 🎯 **Documentation**: Complete troubleshooting and optimization guide

**Integration impact**:
- Enhanced LM Studio adapter robustness
- Improved user confidence in local model tool calling
- Foundation for advanced tool calling features
- Model-specific optimization framework