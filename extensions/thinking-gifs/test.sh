#!/bin/bash

# Test script for thinking-gifs extension
# This script verifies that the extension can be loaded and basic functionality works

set -e

echo "Testing thinking-gifs extension..."
echo ""

# Check if chafa is installed
if ! command -v chafa &> /dev/null; then
    echo "❌ Error: chafa is not installed"
    echo "   Install it with: brew install chafa"
    exit 1
fi
echo "✅ chafa is installed"

# Check if gifs directory exists
if [ ! -d "gifs" ]; then
    echo "❌ Error: gifs/ directory not found"
    echo "   Run this script from the repository root"
    exit 1
fi
echo "✅ gifs/ directory exists"

# Check if there are GIF files
gif_count=$(find gifs -name "*.gif" | wc -l | tr -d ' ')
if [ "$gif_count" -eq 0 ]; then
    echo "❌ Error: No GIF files found in gifs/ directory"
    exit 1
fi
echo "✅ Found $gif_count GIF file(s)"

# Check if extension file exists
if [ ! -f "extensions/thinking-gifs/index.ts" ]; then
    echo "❌ Error: Extension file not found at extensions/thinking-gifs/index.ts"
    exit 1
fi
echo "✅ Extension file exists"

# Test chafa can render a GIF
test_gif=$(find gifs -name "*.gif" | head -n 1)
if chafa --size=40x20 --stretch --symbols block --color-space rgb --dither none "$test_gif" > /dev/null 2>&1; then
    echo "✅ chafa can render GIFs"
else
    echo "❌ Error: chafa failed to render test GIF"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "To use the extension, run:"
echo "  pi -e ./extensions/thinking-gifs/index.ts"
echo ""
echo "Or with full path:"
echo "  pi -e $(pwd)/extensions/thinking-gifs/index.ts"
echo ""
echo "Then try the /thinking-gif command inside pi"
