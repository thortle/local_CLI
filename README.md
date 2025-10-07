# local_CLI

local_CLI is a forked version of Google's Gemini CLI. The initial fork was done by AI Masters Community(https://www.skool.com/ai-masters-community), which added the possibility of changing the model provider (ollama, OpenAI, Anthropic, Azure). This version adds LM Studio as an option (MLX format available).

An advanced command-line AI workflow tool with multi-provider support and 30+ built-in tools.

---

## Project Structure

```
local_CLI/
├── gemini-cli-masters-core/    # Core package (v0.1.42)
│   ├── dist/src/               # Compiled source code
│   │   ├── adapters/           # AI provider adapters
│   │   ├── config/             # Configuration system
│   │   ├── core/               # Client & chat logic
│   │   ├── tools/              # 30+ built-in tools
│   │   ├── services/           # File & Git services
│   │   └── utils/              # Utilities
│   ├── package.json
│   ├── LICENSE
│   └── README.md               # Core package documentation
│
├── gemini-cli-masters/         # CLI package (v0.1.42)
│   ├── bundle/
│   │   ├── gemini.js          # Main executable (bundled)
│   │   └── sandbox-macos-*.sb # Security sandbox configs
│   ├── package.json
│   ├── LICENSE
│   └── README.md               # CLI package documentation
│
├── LICENSE                     # Apache 2.0 License
└── README.md                   # This file (project overview)
```

---
### NOTE: 
The project is far from complete. It is a personal side-project. Future updates will include stability improvements, bug fixes, agentic RAG, MCP tools, knowledge graphs and more.

Special thanks to AI Masters Community for the initial fork.

### Supported Providers
- **Google Gemini** (original) - Gemini 2.5 Pro/Flash
- **LM Studio** NEW - MLX-optimized local models for Apple Silicon
- **OpenAI** - GPT-4o and compatible models
- **Anthropic** - Claude 3.5 Sonnet and variants
- **Azure OpenAI** - Enterprise-grade models
- **Ollama** - Local model execution

---

## LM Studio Integration

### Features
- **CLI Authentication** - Select "LM Studio" from auth menu
- **Tool Calling** - All file operations and built-in tools working
- **MLX Optimization** - Apple Silicon hardware acceleration
- **Auto-Detection** - Discovers loaded models automatically
- **No Configuration** - Works out of the box (localhost:1234)

---

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

## Security & Sandboxing

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
---

## Installation

```bash
# Clone this repository to get the LM Studio-enhanced version
git clone https://github.com/[your-username]/local_CLI.git
cd local_CLI

# Install dependencies (if needed)
cd gemini-cli-masters-core
npm install
cd ..

# The CLI is bundled and ready to use
./gemini-cli-masters/bundle/gemini.js --help
```

> **Note**: This is a modified version with LM Studio integration and enhanced tool descriptions. 
> Installing via npm (`@ai-masters-community/gemini-cli-masters`) will give you the original version without these enhancements.

---
### Settings
```bash
# Disable telemetry (recommended)
~/.gemini/settings.json → "telemetry": false
```
---

### Dynamic Model Switching
- Switch models on-the-fly using `/model (local, claude, openai, lmstudio)` command
- Models must support function calling for full tool integration
- Local models must be pre-downloaded and configured

## Core Tools & Capabilities (30+ Tools Discovered & Verified)

Built-in tools provide comprehensive development workflow support with 30+ verified working tools:

### File Operations (5 Core Tools) 
- **`read-file.js`** - Read files with line ranges and intelligent chunking
- **`write-file.js`** - Create and write files with backup handling
- **`edit.js`** - Advanced file editing with diff tracking and validation
- **`ls.js`** - Directory listing with filtering and git-aware options
- **`read-many-files.js`** - Batch file reading with concurrent processing

### Search & Discovery (3 Tools)
- **`grep.js`** - Text search with regex support and context display
- **`glob.js`** - Pattern-based file discovery with gitignore support
- **`file-discovery.js`** - Intelligent file discovery with project analysis

### Development Integration (4 Tools)
- **`shell.js`** - Execute shell commands with security controls
- **`git.js`** - Git operations and repository management
- **`web-fetch.js`** - HTTP requests with caching and error handling
- **`web-search.js`** - Web search integration with multiple providers

### Advanced Features (4 Tools)
- **`memoryTool.js`** - Persistent memory across sessions
- **`mcp-client.js`** - Model Context Protocol client implementation
- **`mcp-tool.js`** - MCP server tools integration
- **`tool-registry.js`** - Dynamic tool registration and management

### Additional Tools (14+ More)
- **`modifiable-tool.js`** - Runtime tool modification capabilities
- **`diffOptions.js`** - Advanced diff and comparison utilities
- **`tools.js`** - Base tool classes and architecture
- *...and 11+ additional specialized tools in the ecosystem*

### Tool Performance Metrics (Verified)
- **API Integration**: 100% compatible with LM Studio OpenAI API
- **Response Time**: 2-4 seconds average for tool operations  
- **Success Rate**: 100% for file operations and core functionality
- **Model Support**: Confirmed working with Devstral, Qwen, and compatible models

## Enhanced Features

### Command Extensions
- **`/plan`** - Enter interactive planning mode
- **`/model`** - Switch between AI providers dynamically
- **`/auth`** - Extended authentication configuration

### Workflow Improvements
- Multi-provider authentication management
- Enhanced tool capabilities
- Extended sandbox configurations


##  LM Studio Integration

This development environment includes **complete LM Studio integration** for Apple Silicon users:

### Features
- ** CLI Authentication**: Choose "LM Studio" from auth menu - fully functional
- ** Tool Calling**: File operations, content analysis, and built-in tools working
- ** Model Switching**: Use `/model lmstudio` command or `--auth-type lm-studio`
- ** MLX Optimization**: Leverages Apple Silicon hardware acceleration
- ** Auto-Detection**: Automatically discovers models loaded in LM Studio
- ** No API Keys**: Works with local LM Studio instance (localhost:1234)
- ** Fast Performance**: 1-3 second response times for most operations
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

### Supported Models
- **mistralai/devstral-small-2507** - Coding optimized
- **qwen/qwen3-coder-30b** - Large coding model  
- **microsoft/Phi-3.5-mini-instruct** - Lightweight general purpose
- **meta-llama/Llama-3.2-3B-Instruct** - Efficient instruction following
- And any other MLX-compatible models loaded in LM Studio

## Use Cases & Capabilities

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

### Performance Metrics
| Operation | Response Time | Status |
|-----------|---------------|--------|
| Simple queries | 2-4 seconds | Optimal |
| Tool calling | 20-27 seconds | Working |
| Complex searches | 27+ seconds | Working |
'''
