# Gemini CLI Masters - Development Environment

This is a local development copy of the **Gemini CLI Masters**, which is a fork of Google's original Gemini CLI developed by the AI Masters Pro Community. It's an advanced command-line AI workflow tool that connects to various AI providers and tools for enhanced developer productivity.

## 🏗️ Project Structure

```
├── gemini-cli-masters-core/     # Core package (v0.1.42)
│   ├── dist/                    # Compiled TypeScript → JavaScript
│   │   └── src/                 # Source code modules
│   │       ├── adapters/        # AI provider adapters
│   │       │   ├── anthropicContentGenerator.js
│   │       │   ├── azureContentGenerator.js
│   │       │   ├── localLlmContentGenerator.js
│   │       │   └── openaiCompatibleContentGenerator.js
│   │       ├── config/          # Configuration management
│   │       │   ├── config.js    # Main configuration system
│   │       │   └── models.js    # Model definitions
│   │       ├── core/            # Core client & chat logic
│   │       │   ├── client.js    # Main GeminiClient
│   │       │   ├── geminiChat.js
│   │       │   ├── contentGenerator.js
│   │       │   └── turn.js      # Conversation management
│   │       ├── tools/           # Built-in CLI tools (20+ tools)
│   │       │   ├── read-file.js
│   │       │   ├── write-file.js
│   │       │   ├── edit.js
│   │       │   ├── shell.js
│   │       │   ├── grep.js
│   │       │   ├── mcp-client.js
│   │       │   └── ... (and more)
│   │       ├── services/        # File & Git services
│   │       ├── telemetry/       # OpenTelemetry integration
│   │       └── utils/           # Utility functions
│   ├── LICENSE
│   ├── package.json
│   ├── README.md
│   └── node_modules/
├── gemini-cli-masters/          # Main CLI package (v0.1.42)
│   ├── bundle/                  # Bundled executable & configs
│   │   ├── gemini.js           # Main executable (266k+ lines bundled)
│   │   └── sandbox-macos-*.sb  # macOS sandbox security configs
│   ├── LICENSE
│   ├── package.json
│   └── README.md
├── tests/                       # LM Studio integration test suite
│   ├── README.md               # Test documentation
│   ├── step1/                  # Core Infrastructure tests
│   │   ├── test-authtype.js   # AuthType enum validation
│   │   ├── test-adapter.js    # LM Studio adapter creation
│   │   ├── test-registry.js   # Adapter registry integration
│   │   └── test-connection.js # Connection validation
│   ├── step2/                  # Configuration System tests
│   │   ├── test-models.js     # Model definitions and validation
│   │   ├── test-config.js     # Configuration integration
│   │   └── test-env-vars.js   # Environment variable handling
│   ├── step3/                  # CLI Integration tests
│   │   ├── cli-integration.test.js      # CLI integration testing
│   │   ├── integration-workflow.test.js # Integration workflow testing
│   │   └── README.md          # Step 3 documentation
│   ├── step4/                  # Tool Calling Verification & Debugging
│   │   ├── README.md          # Phase 4 testing documentation
│   │   ├── test-api-tool-calling.js    # Direct API tool calling tests
│   │   ├── test-cli-tool-integration.js # CLI tool calling integration
│   │   ├── test-model-optimization.js  # Model-specific optimizations
│   │   └── test-timeout-handling.js    # Timeout and error handling
│   ├── integration/            # Full integration tests
│   │   └── manual-integration-test.js # End-to-end validation
│   └── utils/                  # Test utilities
│       ├── run-tool-tests.js  # Tool calling test suite runner
│       ├── test-runner.js     # Automated test runner
│       ├── test-helpers.js    # Common test functions
│       └── test-lmstudio.js   # LM Studio specific utilities
├── LM_STUDIO_INTEGRATION_PLAN.md # Integration plan and completion status
└── README.md                   # This file
```

## 🤖 AI Provider Support

The CLI supports multiple AI providers through dedicated adapters:

### Supported Providers
- **Google Gemini** (original) - Default provider with Gemini 2.5 Pro/Flash
- **Azure OpenAI** - Enterprise-grade OpenAI models via Azure
- **OpenAI Compatible Models** - Including GPT-4o and other OpenAI models
- **Anthropic Claude Models** - Claude 3.5 Sonnet and other Claude variants
- **Local LLM (Ollama)** - Local model execution with tool support
- **LM Studio** - MLX-optimized local models for Apple Silicon (NEW!)

### Dynamic Model Switching
- Switch models on-the-fly using `/model (local, claude, openai, lmstudio)` command
- Models must support function calling for full tool integration
- Local models must be pre-downloaded and configured

## 🛠️ Core Tools & Capabilities

Built-in tools provide comprehensive development workflow support:

### File Operations
- **`read-file.js`** - Read files with line ranges and large file handling
- **`write-file.js`** - Create and write new files
- **`edit.js`** - Advanced file editing with diff tracking
- **`ls.js`** - Directory listing and exploration
- **`read-many-files.js`** - Batch file reading for context gathering

### Search & Discovery
- **`grep.js`** - Text search across files with regex support
- **`glob.js`** - Pattern-based file discovery
- **`file-discovery.js`** - Intelligent file discovery service

### Development Integration
- **`shell.js`** - Execute shell commands and scripts
- **`git.js`** - Git operations and repository management
- **`web-fetch.js`** - HTTP requests and web content retrieval
- **`web-search.js`** - Web search integration

### Advanced Features
- **`memoryTool.js`** - Persistent memory and context management
- **`mcp-client.js`** - Model Context Protocol integration
- **`mcp-tool.js`** - MCP server tool management
- **`tool-registry.js`** - Dynamic tool registration system

## ⚙️ Enhanced Features by AI Masters Community

### Command Extensions
- **`/plan`** - Enter interactive planning mode
- **`/model`** - Switch between AI providers dynamically
- **`/auth`** - Extended authentication configuration

### Workflow Improvements
- Multi-provider authentication management
- Enhanced tool capabilities
- Improved context management
- Extended sandbox configurations

## 🏛️ Architecture Overview

### Core Components
- **`GeminiClient`** - Main client orchestrating AI interactions
- **`GeminiChat`** - Chat session and conversation management
- **`ContentGenerator`** - Provider abstraction layer
- **`ToolRegistry`** - Tool discovery and execution management
- **`Turn`** - Individual conversation turn handling

### Configuration System
- **Flexible Model Configuration** - Support for multiple providers
- **Sandbox Environment** - Secure execution environments
- **Telemetry Integration** - OpenTelemetry observability
- **Authentication Framework** - Multi-provider auth support

## 📦 Technology Stack & Dependencies

### Core Dependencies
- **`@google/genai`** ^1.8.0 - Google AI integration and Gemini API
- **`@modelcontextprotocol/sdk`** ^1.11.0 - MCP protocol support
- **`@opentelemetry/*`** - Comprehensive observability and telemetry
- **`simple-git`** ^3.28.0 - Git repository operations
- **`ws`** ^8.18.0 - WebSocket support for real-time communication
- **`undici`** ^7.10.0 - Modern HTTP client
- **`google-auth-library`** ^9.11.0 - Google authentication
- **`glob`** ^10.4.5 - File pattern matching
- **`micromatch`** ^4.0.8 - Advanced glob pattern matching

### Development Stack
- **TypeScript** → JavaScript compilation
- **ESBuild** ^0.25.0 - Fast bundling and compilation
- **Vitest** ^3.2.4 - Modern testing framework
- **ESLint + Prettier** - Code quality and formatting
- **Node.js** >=20.0.0 - Runtime requirement

## 🔒 Security & Sandboxing

### macOS Sandbox Configurations
Located in `bundle/sandbox-macos-*.sb`:

- **`sandbox-macos-permissive-*`** - More open file/network access
- **`sandbox-macos-restrictive-*`** - Limited permissions for security
- **Network Variants:**
  - `*-open.sb` - Allow all outbound network
  - `*-closed.sb` - Deny outbound network
  - `*-proxied.sb` - Route through localhost:8877 proxy

### Security Features
- Controlled file system access
- Network access restrictions
- Process execution limitations
- Debugger port allowance (localhost:9229)

## 🚀 Installation & Usage

### Global Installation
```bash
npm install -g @ai-masters-community/gemini-cli-masters-core@latest @ai-masters-community/gemini-cli-masters@latest
gemini-masters
```

### Authentication Options
1. **Google Account** - Personal Google authentication
2. **Gemini API Key** - From Google AI Studio
3. **Azure OpenAI** - Enterprise Azure credentials
4. **OpenAI API** - OpenAI API keys
5. **Local Models** - Ollama configuration
6. **LM Studio** - Local MLX-optimized models (no additional config needed)

### Environment Variables
```bash
export GEMINI_API_KEY="your_api_key"
export AZURE_OPENAI_ENDPOINT="your_azure_endpoint"
export OPENAI_API_KEY="your_openai_key"
# LM Studio (optional - auto-detected)
export LM_STUDIO_BASE_URL="http://127.0.0.1:1234"
export LM_STUDIO_MODEL="mistralai/devstral-small-2507"
```

## 🆕 LM Studio Integration (NEW!)

This development environment includes **complete LM Studio integration** for Apple Silicon users:

### Features ✅
- **Direct Authentication**: Choose "LM Studio" from auth menu - no additional setup needed
- **Model Switching**: Use `/model lmstudio` command to switch to local models
- **MLX Optimization**: Leverages Apple Silicon hardware acceleration
- **Auto-Detection**: Automatically discovers models loaded in LM Studio
- **No API Keys**: Works with local LM Studio instance (localhost:1234)

### Quick Start with LM Studio
```bash
# 1. Start LM Studio and load any MLX model
# 2. Run Gemini CLI Masters
gemini-masters

# 3. Choose "LM Studio" from authentication menu
# 4. Press Enter when prompted - no config needed
# 5. Start chatting with local models!

# Or switch to LM Studio anytime:
> /model lmstudio
```

### Supported Models
- **mistralai/devstral-small-2507** (default) - Coding optimized
- **qwen/qwen3-coder-30b** - Large coding model  
- **microsoft/Phi-3.5-mini-instruct** - Lightweight general purpose
- **meta-llama/Llama-3.2-3B-Instruct** - Efficient instruction following
- And any other MLX-compatible models loaded in LM Studio

## 💡 Use Cases & Capabilities

### Code Development
- **Large Codebase Exploration** - Navigate codebases beyond 1M token limits
- **Intelligent Code Generation** - From specs, PDFs, or sketches
- **Code Refactoring** - Automated code improvements and migrations
- **Code Review** - Automated analysis and suggestions

### Workflow Automation
- **Operational Tasks** - Pull request analysis, complex git operations
- **Build & Deploy** - Automated development workflows
- **Documentation** - Auto-generated docs from code analysis
- **Testing** - Test generation and analysis

### Integration Capabilities
- **MCP Servers** - Connect external tools and services
- **Shell Integration** - Execute system commands seamlessly
- **Web Integration** - Fetch web content and perform searches
- **Git Operations** - Advanced repository management

### Multimodal Support
- **Image Analysis** - Process diagrams, screenshots, mockups
- **Document Processing** - Extract information from PDFs
- **Media Generation** - Integration with Imagen, Veo, Lyria (via MCP)

## 🧪 Development Environment Features

### Enhanced Development Environment

This development environment provides comprehensive capabilities:

✅ **Production-Ready Integration** - LM Studio integration deployed globally  
✅ **Version Control Ready** - Full git integration for tracking changes  
✅ **Feature Development** - Complete testing framework for safe development  
✅ **Source Code Access** - Full access to core implementation and tools  
✅ **Custom Extensions** - Framework for adding custom tools and adapters  
✅ **Comprehensive Testing** - Multi-phase test suite for validation  

### Package Information
- **gemini-cli-masters-core (v0.1.42)** - Core functionality, tools, and utilities
- **gemini-cli-masters (v0.1.42)** - CLI interface and bundled application  
- **LM Studio Integration** - Complete integration with authentication and model switching
- **Main Entry**: `dist/index.js` (core) and `bundle/gemini.js` (CLI with LM Studio support)

## 🔧 Development Workflow

### Current Development Status
- **LM Studio Integration**: ✅ Complete (Steps 1-3 implemented and tested)
- **Global Deployment**: ✅ Enhanced version installed globally via `npm install -g`
- **Testing Framework**: ✅ Comprehensive multi-phase test suite implemented
- **Documentation**: ✅ Complete documentation structure with specialized guides

### Source Code Exploration
1. **Core Logic**: `gemini-cli-masters-core/dist/src/core/` - Client and chat management
2. **Tools**: `gemini-cli-masters-core/dist/src/tools/` - Built-in tool implementations
3. **Adapters**: `gemini-cli-masters-core/dist/src/adapters/` - AI provider integrations
4. **Configuration**: `gemini-cli-masters-core/dist/src/config/` - System configuration
5. **Bundle**: `gemini-cli-masters/bundle/gemini.js` - Modified executable with LM Studio support

### Future Development Workflow
1. **Create Feature Branch** - `git checkout -b feature/your-feature`
2. **Modify Source Code** - Edit TypeScript files or JavaScript directly
3. **Test Changes** - Use comprehensive test suite in `/tests`
4. **Build & Bundle** - Compile changes for production
5. **Deploy Globally** - Install enhanced version globally

### Build Scripts
```bash
npm run build          # Build packages
npm run bundle         # Create bundled executable
npm run test          # Run test suite
npm run lint          # Code quality checks
npm run format        # Code formatting

# Testing LM Studio Integration
cd tests && node utils/test-runner.js --all  # Run all integration tests
```

## 🌟 Advanced Capabilities

### Model Context Protocol (MCP)
- **Server Integration** - Connect to MCP-enabled services
- **Tool Expansion** - Add external tools via MCP protocol
- **Service Composition** - Combine multiple services seamlessly

### Large Context Handling
- **1M+ Token Support** - Handle massive codebases
- **Context Compression** - Intelligent context summarization
- **Memory Management** - Persistent conversation memory
- **Token Optimization** - Efficient token usage strategies

### Enterprise Features
- **Multi-tenant Support** - Team and organization management
- **Audit Logging** - Comprehensive telemetry and logging
- **Security Controls** - Sandbox execution and access controls
- **Scalable Architecture** - Production-ready deployment

---

## 📍 Installation Status

- **Current Global Installation**: This local development version with LM Studio integration
- **Installation Path**: `/opt/homebrew/bin/gemini-masters` (via `npm install -g`)
- **Local Development**: `~/Desktop/ML/CLI/` (source for current global installation)
- **Bundle Status**: Modified `bundle/gemini.js` deployed globally with LM Studio support

The enhanced local development version with complete LM Studio integration has been installed globally and is fully functional.

## 📋 Documentation Structure

### Main Project Documentation
- **`README.md`** - This file (complete project overview, architecture, and features)
- **`LM_STUDIO_INTEGRATION_PLAN.md`** - LM Studio integration documentation
  - ✅ Implementation completion status and technical details
  - 🚀 Five future development phase options with timelines
  - 📊 Success metrics, validation results, and next steps

### Testing & Development Documentation
- **`tests/README.md`** - Testing framework methodology and guidelines
  - 🧪 Test strategy, setup requirements, and troubleshooting
  - 🔧 Development guidelines for adding new tests
  - 📊 Quick reference for test commands and output format
- **`tests/step3/README.md`** - CLI integration debugging guide
  - 🐛 Specific debugging procedures for authentication and bundle issues
  - 🔍 Manual testing workflows and validation commands
  - ⚡ Troubleshooting guide for common CLI integration problems

### Package Documentation
- **`gemini-cli-masters-core/README.md`** - Core package documentation
- **`gemini-cli-masters/README.md`** - CLI package documentation

> **Note**: Each README serves a specific purpose to avoid redundancy. The main README provides the complete overview, while specialized READMEs focus on their specific domains (testing, debugging, integration planning).
