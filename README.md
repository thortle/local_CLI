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
└── gemini-cli-masters/          # Main CLI package (v0.1.42)
    ├── bundle/                  # Bundled executable & configs
    │   ├── gemini.js           # Main executable (266k+ lines bundled)
    │   └── sandbox-macos-*.sb  # macOS sandbox security configs
    ├── LICENSE
    ├── package.json
    └── README.md
```

## 🤖 AI Provider Support

The CLI supports multiple AI providers through dedicated adapters:

### Supported Providers
- **Google Gemini** (original) - Default provider with Gemini 2.5 Pro/Flash
- **Azure OpenAI** - Enterprise-grade OpenAI models via Azure
- **OpenAI Compatible Models** - Including GPT-4o and other OpenAI models
- **Anthropic Claude Models** - Claude 3.5 Sonnet and other Claude variants
- **Local LLM (Ollama)** - Local model execution with tool support

### Dynamic Model Switching
- Switch models on-the-fly using `/model (local, claude, openai)` command
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

### Environment Variables
```bash
export GEMINI_API_KEY="your_api_key"
export AZURE_OPENAI_ENDPOINT="your_azure_endpoint"
export OPENAI_API_KEY="your_openai_key"
```

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

### Safe Development Environment

This local development copy provides:

✅ **Isolated Development** - Modify code without affecting global installation  
✅ **Version Control Ready** - Track changes with git integration  
✅ **Feature Development** - Test new features safely  
✅ **Experimentation** - Try changes and revert easily  
✅ **Code Analysis** - Explore the full source code structure  
✅ **Custom Tool Development** - Add your own tools to the registry  

### Package Information
- **gemini-cli-masters-core (v0.1.42)** - Core functionality, tools, and utilities
- **gemini-cli-masters (v0.1.42)** - CLI interface and bundled application
- **Main Entry**: `dist/index.js` (core) and `bundle/gemini.js` (CLI)

## 🔧 Development Workflow

### Exploring the Source
1. **Core Logic**: `gemini-cli-masters-core/dist/src/core/` - Client and chat management
2. **Tools**: `gemini-cli-masters-core/dist/src/tools/` - Built-in tool implementations
3. **Adapters**: `gemini-cli-masters-core/dist/src/adapters/` - AI provider integrations
4. **Configuration**: `gemini-cli-masters-core/dist/src/config/` - System configuration

### Adding New Features
1. **Create Feature Branch** - `git checkout -b feature/your-feature`
2. **Modify Source Code** - Edit TypeScript files or JavaScript directly
3. **Test Changes** - Use local development environment
4. **Build & Bundle** - Compile changes for production
5. **Deploy Safely** - Test before affecting global installation

### Build Scripts
```bash
npm run build          # Build packages
npm run bundle         # Create bundled executable
npm run test          # Run test suite
npm run lint          # Code quality checks
npm run format        # Code formatting
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

## 📍 Global vs Local

- **Global Installation**: `/opt/homebrew/Cellar/node/24.8.0/lib/node_modules/@ai-masters-community/`
- **Local Development**: `~/Desktop/ML/CLI/`

Your global installation remains untouched and functional while you develop here.

---

**Note**: This development environment was created by copying the installed packages on September 30, 2025. The Gemini CLI Masters is actively maintained by the AI Masters Pro Community with regular updates and new features.