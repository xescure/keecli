#!/usr/bin/env bash

# Test script to demonstrate environment variable support in FX CLI
# This script shows how to use environment variables instead of command line flags

set -e

echo "🧪 FX CLI Environment Variables Test"
echo "===================================="

# Check if the CLI is built
if [ ! -f "dist/index.js" ]; then
    echo "❌ CLI not built. Running npm run build..."
    npm run build
fi

echo ""
echo "1️⃣  Testing help output (no env vars needed)"
echo "--------------------------------------------"
node dist/index.js --help

echo ""
echo "2️⃣  Testing environment variable support"
echo "---------------------------------------"

# Set example environment variables
export FX_CLI_PASSPHRASE="test-passphrase-for-demo"
export FX_CLI_RESOLVER="0x06abc123def456789test"
export FX_CLI_TOKEN="$TOKEN_A"
export FX_CLI_FROM="$TOKEN_A"
export FX_CLI_TO="$TOKEN_B"
export FX_CLI_AMOUNT="1000"
export FX_CLI_AFFINITY="from"

echo "Environment variables set:"
echo "  FX_CLI_PASSPHRASE='$FX_CLI_PASSPHRASE'"
echo "  FX_CLI_RESOLVER='$FX_CLI_RESOLVER'"
echo "  FX_CLI_TOKEN='$FX_CLI_TOKEN'"
echo "  FX_CLI_FROM='$FX_CLI_FROM'"
echo "  FX_CLI_TO='$FX_CLI_TO'"
echo "  FX_CLI_AMOUNT='$FX_CLI_AMOUNT'"
echo "  FX_CLI_AFFINITY='$FX_CLI_AFFINITY'"

echo ""
echo "3️⃣  Testing faucet command with env vars"
echo "---------------------------------------"
echo "Command: fx-cli faucet (no flags needed, uses FX_CLI_PASSPHRASE)"
echo "This would run: node dist/index.js faucet"
echo "(Not executing to avoid actual faucet request)"

echo ""
echo "4️⃣  Testing list-tokens command with env vars"
echo "--------------------------------------------"
echo "Command: fx-cli list-tokens (no flags needed, uses env vars)"
echo "This would run: node dist/index.js list-tokens"
echo "(Not executing to avoid actual network request)"

echo ""
echo "5️⃣  Testing list-conversions command with env vars"
echo "------------------------------------------------"
echo "Command: fx-cli list-conversions (no flags needed, uses env vars)"
echo "This would run: node dist/index.js list-conversions"
echo "(Not executing to avoid actual network request)"

echo ""
echo "6️⃣  Testing swap command with env vars"
echo "-------------------------------------"
echo "Command: fx-cli swap (no flags needed, uses env vars)"
echo "This would run: node dist/index.js swap"
echo "(Not executing to avoid actual swap attempt)"

echo ""
echo "7️⃣  Testing command line override of env vars"
echo "--------------------------------------------"
echo "Command: fx-cli swap --amount 2000 --to \$TOKEN_C"
echo "This overrides the env var amount (1000) and to token (\$TOKEN_B)"
echo "Final values would be:"
echo "  passphrase: from FX_CLI_PASSPHRASE"
echo "  resolver: from FX_CLI_RESOLVER"
echo "  from: from FX_CLI_FROM (\$TOKEN_A)"
echo "  to: \$TOKEN_C (overridden)"
echo "  amount: 2000 (overridden)"
echo "  affinity: from FX_CLI_AFFINITY (from)"

echo ""
echo "8️⃣  Testing help for individual commands"
echo "---------------------------------------"
echo "Getting help for faucet command..."
node dist/index.js faucet --help

echo ""
echo "Getting help for swap command..."
node dist/index.js swap --help

echo ""
echo "✅ Environment variable test completed!"
echo ""
echo "💡 To actually use the CLI with your credentials:"
echo "   1. Copy example.env to .env"
echo "   2. Fill in your real passphrase and resolver"
echo "   3. Source the environment: source .env"
echo "   4. Run commands: ./fx-cli.sh list-tokens"
echo ""
echo "🔒 Remember: Never commit .env files with real credentials!"
