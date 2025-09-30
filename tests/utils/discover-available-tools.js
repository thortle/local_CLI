#!/usr/bin/env node

/**
 * Available Tools Discovery Script
 * Purpose: Discover all available tools in the Gemini CLI Masters environment
 * Usage: node discover-available-tools.js
 */

console.log('🔧 Discovering Available Tools in Gemini CLI Masters');
console.log('==================================================');
console.log('');

// Method 1: Ask the CLI directly what tools it has
async function discoverToolsViaChat() {
    console.log('📋 Method 1: Asking CLI directly about available tools...');
    
    const { spawn } = require('child_process');
    
    const query = "Please list all the tools and commands you have available. Include built-in tools, file operations, development tools, and any other capabilities you can access.";
    
    return new Promise((resolve) => {
        const child = spawn('gemini-masters', ['--auth-type', 'lm-studio', '-p', query], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0 && stdout.trim()) {
                console.log('✅ CLI Response about available tools:');
                console.log(stdout.trim());
            } else {
                console.log('⚠️ CLI query failed or returned no tools info');
                if (stderr) console.log('Error:', stderr);
            }
            resolve();
        });

        // Set timeout
        setTimeout(() => {
            child.kill('SIGTERM');
            console.log('⏰ CLI query timed out');
            resolve();
        }, 15000);
    });
}

// Method 2: Check CLI source code for tool definitions
async function discoverToolsFromSource() {
    console.log('\\n📁 Method 2: Analyzing source code for tool definitions...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check the main CLI bundle
    const bundlePath = '/Users/thortle/Desktop/ML/CLI/gemini-cli-masters/bundle/gemini.js';
    
    if (fs.existsSync(bundlePath)) {
        console.log('✅ Found CLI bundle, searching for tool definitions...');
        
        try {
            const content = fs.readFileSync(bundlePath, 'utf8');
            
            // Look for tool-related patterns
            const toolPatterns = [
                /Tool\.Name\s*=\s*"([^"]+)"/g,
                /name:\s*"([^"]+).*tool/gi,
                /class\s+(\w+Tool)/g,
                /"([^"]+\.js)"/g
            ];
            
            const foundTools = new Set();
            
            toolPatterns.forEach((pattern, index) => {
                const matches = [...content.matchAll(pattern)];
                if (matches.length > 0) {
                    console.log(`\\n  Pattern ${index + 1} found ${matches.length} matches:`);
                    matches.slice(0, 10).forEach(match => {
                        if (match[1] && match[1].length < 50) {
                            foundTools.add(match[1]);
                        }
                    });
                }
            });
            
            if (foundTools.size > 0) {
                console.log('\\n📝 Discovered tool names from source:');
                [...foundTools].sort().forEach(tool => {
                    console.log(`  - ${tool}`);
                });
            }
            
        } catch (error) {
            console.log('❌ Error reading CLI bundle:', error.message);
        }
    } else {
        console.log('❌ CLI bundle not found at expected location');
    }
}

// Method 3: Check for tool files in the source directory
async function discoverToolFiles() {
    console.log('\\n📂 Method 3: Looking for tool files in source directories...');
    
    const fs = require('fs');
    const path = require('path');
    
    const toolDirs = [
        '/Users/thortle/Desktop/ML/CLI/gemini-cli-masters-core/dist/src/tools',
        '/Users/thortle/Desktop/ML/CLI/gemini-cli-masters-core/src/tools'
    ];
    
    for (const toolDir of toolDirs) {
        if (fs.existsSync(toolDir)) {
            console.log(`\\n✅ Found tools directory: ${toolDir}`);
            try {
                const files = fs.readdirSync(toolDir);
                const toolFiles = files.filter(file => file.endsWith('.js'));
                
                console.log(`📁 Found ${toolFiles.length} tool files:`);
                toolFiles.sort().forEach(file => {
                    console.log(`  - ${file}`);
                });
            } catch (error) {
                console.log(`❌ Error reading ${toolDir}:`, error.message);
            }
        } else {
            console.log(`⚠️ Directory not found: ${toolDir}`);
        }
    }
}

// Method 4: Test specific tools via CLI
async function testSpecificTools() {
    console.log('\\n🧪 Method 4: Testing specific tool categories...');
    
    const toolTests = [
        { category: 'File Operations', test: 'Can you list files in the current directory?' },
        { category: 'Content Reading', test: 'Can you read a file?' },
        { category: 'Web Access', test: 'Can you fetch content from a website?' },
        { category: 'Shell Commands', test: 'Can you execute shell commands?' },
        { category: 'Git Operations', test: 'Can you check git status?' },
        { category: 'Search Tools', test: 'Can you search for text in files?' }
    ];
    
    console.log('📋 Tool categories to test:');
    toolTests.forEach(test => {
        console.log(`  - ${test.category}: ${test.test}`);
    });
    
    console.log('\\n💡 To test these, run individual queries with the CLI');
}

// Method 5: Check README and documentation
async function checkDocumentation() {
    console.log('\\n📚 Method 5: Tools documented in README files...');
    
    const fs = require('fs');
    
    // Tools from main README
    const mainReadmeTools = [
        'read-file.js', 'write-file.js', 'edit.js', 'ls.js', 'read-many-files.js',
        'grep.js', 'glob.js', 'file-discovery.js',
        'shell.js', 'git.js', 'web-fetch.js', 'web-search.js',
        'memoryTool.js', 'mcp-client.js', 'mcp-tool.js', 'tool-registry.js'
    ];
    
    console.log('✅ Tools documented in main README:');
    
    console.log('\\n  📁 File Operations:');
    console.log('    - read-file.js (read files with line ranges)');
    console.log('    - write-file.js (create and write files)');
    console.log('    - edit.js (advanced file editing with diff tracking)');
    console.log('    - ls.js (directory listing)');
    console.log('    - read-many-files.js (batch file reading)');
    
    console.log('\\n  🔍 Search & Discovery:');
    console.log('    - grep.js (text search with regex)');
    console.log('    - glob.js (pattern-based file discovery)');
    console.log('    - file-discovery.js (intelligent file discovery)');
    
    console.log('\\n  ⚙️ Development Integration:');
    console.log('    - shell.js (execute shell commands)');
    console.log('    - git.js (git operations)');
    console.log('    - web-fetch.js (HTTP requests)');
    console.log('    - web-search.js (web search integration)');
    
    console.log('\\n  🔧 Advanced Features:');
    console.log('    - memoryTool.js (persistent memory)');
    console.log('    - mcp-client.js (Model Context Protocol)');
    console.log('    - mcp-tool.js (MCP server tools)');
    console.log('    - tool-registry.js (dynamic tool registration)');
    
    console.log('\\n  💬 Command Extensions:');
    console.log('    - /plan (interactive planning mode)');
    console.log('    - /model (switch AI providers)');
    console.log('    - /auth (authentication configuration)');
}

// Main execution
async function main() {
    await discoverToolsViaChat();
    await discoverToolsFromSource();
    await discoverToolFiles();
    await testSpecificTools();
    await checkDocumentation();
    
    console.log('\\n🎯 Tool Discovery Summary');
    console.log('=========================');
    console.log('✅ Multiple methods used to discover available tools');
    console.log('📝 Check CLI responses above for real-time tool availability');
    console.log('📁 Check source analysis for comprehensive tool list');
    console.log('📚 Check documentation section for detailed tool descriptions');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Test specific tools with CLI queries');
    console.log('   2. Update main README with verified tool list');
    console.log('   3. Create tool reference documentation');
}

main().catch(console.error);