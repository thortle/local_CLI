#!/bin/bash

# Tool Usage Investigation - Quick Reference
# Last Updated: October 1, 2025

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Tool Usage Investigation - Quick Reference               ║"
echo "║   Framework Complete - Ready to Execute                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📍 Current Location:${NC}"
pwd
echo ""

echo -e "${BLUE}📋 Prerequisites Check:${NC}"
echo ""

# Check LM Studio
echo -n "1. LM Studio Connection... "
if curl -s http://127.0.0.1:1234/v1/models > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ONLINE${NC}"
    MODELS=$(curl -s http://127.0.0.1:1234/v1/models | grep -o '"id"' | wc -l | tr -d ' ')
    echo "   Models loaded: $MODELS"
else
    echo -e "${YELLOW}❌ OFFLINE${NC}"
    echo "   Please start LM Studio on http://127.0.0.1:1234"
fi
echo ""

# Check test scripts
echo "2. Test Scripts:"
SCRIPTS=("test-tool-usage-awareness.js" "test-prompting-strategies.js" "test-model-comparison.js" "test-cli-vs-api-analysis.js" "run-all-tool-tests.js")
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo -e "   ${GREEN}✅${NC} $script"
    else
        echo -e "   ${YELLOW}❌${NC} $script (missing)"
    fi
done
echo ""

echo -e "${BLUE}🚀 Quick Start Commands:${NC}"
echo ""
echo "Run Full Investigation (8-12 min):"
echo "  node run-all-tool-tests.js"
echo ""
echo "Run Individual Tests:"
echo "  node test-tool-usage-awareness.js     # 2-3 min"
echo "  node test-prompting-strategies.js     # 3-4 min"
echo "  node test-model-comparison.js         # 2-3 min per model"
echo "  node test-cli-vs-api-analysis.js      # 1-2 min"
echo ""

echo -e "${BLUE}📊 What Gets Generated:${NC}"
echo ""
echo "JSON Reports:"
echo "  • tool-awareness-results.json         - Tool usage patterns"
echo "  • prompting-strategies-results.json   - Best prompting approaches"
echo "  • model-comparison-results.json       - Model performance"
echo "  • cli-vs-api-analysis.json           - Behavioral differences"
echo "  • test-suite-summary.json            - Overall summary"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo ""
echo "  • README.md                           - Quick start guide"
echo "  • TOOL-USAGE-INVESTIGATION-GUIDE.md   - Complete guide"
echo "  • INVESTIGATION-SUMMARY.md            - Executive summary"
echo "  • CLI-RESPONSE-DEBUGGING.md           - Previous debugging work"
echo ""

echo -e "${BLUE}💡 Expected Findings:${NC}"
echo ""
echo "  1. System messages significantly impact tool usage"
echo "  2. Explicit requests outperform implicit (~90% vs ~60%)"
echo "  3. Model variation exists (20-40% difference)"
echo "  4. CLI adds overhead compared to direct API"
echo ""

echo -e "${BLUE}🎯 Success Metrics:${NC}"
echo ""
echo "  • Tool usage rate: >80% when needed"
echo "  • Response time: <5s average"
echo "  • Explicit success: >90%"
echo "  • Implicit success: >70%"
echo ""

echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo ""
echo "LM Studio not connecting?"
echo "  curl http://127.0.0.1:1234/v1/models"
echo ""
echo "Test scripts not found?"
echo "  ls -la test-*.js"
echo ""
echo "Tests timing out?"
echo "  • Check LM Studio isn't overloaded"
echo "  • Try with smaller/faster model"
echo "  • Increase timeout in test scripts"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Ready to Execute - Run: node run-all-tool-tests.js      ║"
echo "╚════════════════════════════════════════════════════════════╝"
