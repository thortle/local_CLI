#!/bin/bash

# Quick CLI Test - Validates that CLI is working without timeouts
# Usage: ./quick-cli-test.sh

echo "═══════════════════════════════════════════════════════════"
echo "  QUICK CLI TEST"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check settings file
echo "📋 Checking telemetry settings..."
if [ -f ~/.gemini/settings.json ]; then
    if grep -q '"telemetry": false' ~/.gemini/settings.json; then
        echo "✅ Telemetry is disabled in settings"
    else
        echo "⚠️  Warning: Telemetry not explicitly disabled"
        echo "   Run: echo '{\"theme\":\"Dracula\",\"selectedAuthType\":\"lm-studio\",\"apiKeys\":{},\"telemetry\":false}' > ~/.gemini/settings.json"
    fi
else
    echo "❌ Settings file not found at ~/.gemini/settings.json"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Simple Math (Should respond in 2-5 seconds)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START=$(date +%s)
RESULT=$(gemini-masters --auth-type lm-studio -p "What is 8 * 7? Reply with just the number." 2>&1 | grep -v "Deprecation")
END=$(date +%s)
DURATION=$((END - START))

echo "Response: $RESULT"
echo "Duration: ${DURATION}s"

if [ $DURATION -lt 10 ]; then
    echo "✅ Fast response (<10s)"
else
    echo "⚠️  Slow response (>10s)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Tool Calling (Should use list_directory tool)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START=$(date +%s)
RESULT=$(gemini-masters --auth-type lm-studio -p "List the files in the current directory." 2>&1 | head -3 | grep -v "Deprecation")
END=$(date +%s)
DURATION=$((END - START))

echo "Response (first 3 lines): $RESULT"
echo "Duration: ${DURATION}s"

if [ $DURATION -lt 30 ]; then
    echo "✅ Completed within 30s"
else
    echo "⚠️  Took longer than 30s"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  TEST COMPLETE"
echo "═══════════════════════════════════════════════════════════"
