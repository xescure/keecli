#!/usr/bin/env bash

# FX CLI Wrapper Script
# This script makes it easier to run the FX CLI without having to specify the full path

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if the dist directory exists
if [ ! -d "$SCRIPT_DIR/dist" ]; then
    echo "❌ Build directory not found. Please run 'npm run build' first."
    exit 1
fi

# Check if the main CLI file exists
if [ ! -f "$SCRIPT_DIR/dist/index.js" ]; then
    echo "❌ CLI binary not found. Please run 'npm run build' first."
    exit 1
fi

# Run the CLI with all passed arguments
node "$SCRIPT_DIR/dist/index.js" "$@"
