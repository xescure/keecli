# Migration Guide: From fx-client.ts to Modular CLI

This document explains how the original `fx-client.ts` file was transformed into a comprehensive, modular CLI application.

## 🔄 Transformation Overview

### Original Structure
```
fx/src/dev/fx-client.ts
├── testFXClient() function (72 lines)
└── All functionality in single function
```

### New Structure
```
fx-cli/
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── lib/
│   │   ├── fx-client.ts         # Core FX client
│   │   ├── account.ts           # Account utilities
│   │   └── faucet.ts            # Faucet client
│   └── commands/
│       ├── list-tokens.ts       # Token discovery
│       ├── list-conversions.ts  # Conversion discovery
│       ├── swap.ts              # Token swapping
│       └── faucet.ts            # Faucet requests
├── package.json                 # Dependencies & scripts
├── README.md                    # Documentation
└── example.env                  # Environment variables
```

## 📋 Feature Mapping

### Original testFXClient() Steps → New CLI Commands

| Original Step | New Command | Purpose |
|---------------|-------------|---------|
| Step 1a: `fxClient.resolver.listTokens()` | `list-tokens` | Discover available tokens |
| Step 1b: `fxClient.listPossibleConversions()` | `list-conversions` | Find conversion paths |
| Steps 2-4: Estimate → Quote → Execute | `swap` | Complete swap workflow |
| N/A (new feature) | `faucet` | Request test tokens |

### Code Evolution

#### Original: Single Function
```typescript
export async function testFXClient(
  resolverAccount: GenericAccount,
  userClient: KeetaNet.UserClient,
): Promise<void> {
  // 72 lines of mixed logic
  const fxClient = new AnchorClient.FX.Client(userClient, { root: resolverAccount });
  const tokenList = await fxClient.resolver.listTokens();
  const conversions = await fxClient.listPossibleConversions({ from: "$TOKEN_A" });
  // ... more hardcoded logic
}
```

#### New: Modular CLI
```typescript
// lib/fx-client.ts - Reusable client
export class FXClient {
  async listTokens(): Promise<TokenInfo[]> { /* */ }
  async listConversions(token: string): Promise<any[]> { /* */ }
  async executeSwap(params: SwapParams): Promise<SwapResult> { /* */ }
}

// commands/list-tokens.ts - Focused command
export const handler = async (argv: any) => {
  const userClient = await createUserClientFromPassphrase(argv.passphrase);
  const fxClient = createFXClient(argv.resolver, userClient);
  const tokens = await fxClient.listTokens();
  // Display results
};
```

## 🚀 Key Improvements

### 1. Separation of Concerns
- **Original**: Mixed UI, logic, and hardcoded values
- **New**: Separate commands, reusable libraries, configurable parameters

### 2. Flexibility
- **Original**: Hardcoded `$TOKEN_A` and `$TOKEN_B`
- **New**: User-specified tokens via CLI arguments or environment variables

### 3. User Experience
- **Original**: Programmatic function call
- **New**: Command-line interface with help, examples, and error handling

### 4. Extensibility
- **Original**: Monolithic function
- **New**: Modular commands that can be easily added or modified

## 📊 Detailed Migration Steps

### Step 1: Extract Core Logic
```typescript
// Original: Inline FX client creation
const fxClient = new AnchorClient.FX.Client(userClient as any, {
  root: resolverAccount as any,
});

// New: Reusable factory function
export function createFXClient(resolverString: string, userClient: KeetaNet.UserClient): FXClient {
  const resolverAccount = KeetaNet.lib.Account.fromPublicKeyString(resolverString);
  return new FXClient({ resolverAccount, userClient });
}
```

### Step 2: Parameterize Hardcoded Values
```typescript
// Original: Hardcoded tokens and amounts
const conversions = await fxClient.listPossibleConversions({ from: "$TOKEN_A" });
const estimates = await fxClient.getEstimates({
  affinity: "from",
  amount: "1000",
  from: "$TOKEN_A",
  to: "$TOKEN_B",
});

// New: User-configurable parameters
const conversions = await fxClient.listConversions(argv.token);
const estimates = await fxClient.getEstimates({
  from: argv.from,
  to: argv.to,
  amount: argv.amount,
  affinity: argv.affinity
});
```

### Step 3: Split Functionality into Commands
```typescript
// Original: All steps in one function
console.log("1. Discovering available services...");
// Step 1 code...
console.log("2. Getting estimate for a trade...");  
// Step 2 code...
console.log("3. Requesting a firm, signed quote...");
// Step 3 code...
console.log("4. Creating and submitting the exchange...");
// Step 4 code...

// New: Separate commands
// list-tokens.ts - Step 1a
// list-conversions.ts - Step 1b  
// swap.ts - Steps 2-4
// faucet.ts - New functionality
```

### Step 4: Add CLI Infrastructure
```typescript
// New: CLI entry point with yargs
const cli = yargs(hideBin(process.argv))
  .scriptName("fx-cli")
  .env("FX_CLI")  // Environment variable support
  .command(listTokens)
  .command(listConversions) 
  .command(swap)
  .command(faucet);
```

## 🛠️ Usage Comparison

### Original Usage
```typescript
// Had to be called from another TypeScript file
import { testFXClient } from './fx-client.js';

const resolverAccount = /* create resolver account */;
const userClient = /* create user client */;
await testFXClient(resolverAccount, userClient);
```

### New Usage
```bash
# Command line interface - much more user-friendly
fx-cli list-tokens -p "passphrase" -r "resolver"
fx-cli swap -f "$TOKEN_A" -t "$TOKEN_B" -a "1000"

# Or with environment variables
export FX_CLI_PASSPHRASE="passphrase"
export FX_CLI_RESOLVER="resolver"
fx-cli list-tokens
```

## 🔧 Environment Variable Enhancement

### Original: No Configuration Support
- All values hardcoded in source
- Required code changes for different tokens/amounts

### New: Full Environment Support
```bash
# Set once, use everywhere
export FX_CLI_PASSPHRASE="your-passphrase"
export FX_CLI_RESOLVER="0x06abc123..."
export FX_CLI_FROM="$TOKEN_A"
export FX_CLI_TO="$TOKEN_B"

# Now all commands work without flags
fx-cli list-tokens
fx-cli swap --amount 2000  # Override just the amount
```

## 📈 Benefits Achieved

### For Developers
- **Reusable Components**: Extract and reuse FX client logic
- **Easy Testing**: Individual commands can be tested separately
- **Clear Structure**: Easy to understand and modify

### For End Users  
- **Simple Interface**: Standard CLI with help and examples
- **Flexible Configuration**: Environment variables + command line options
- **Better Errors**: Clear, actionable error messages

### For Operations
- **Scriptable**: Easy to integrate into automated workflows
- **Configurable**: Environment-based configuration
- **Observable**: Clear progress indicators and logging

## 🚀 Future Extensions

The modular architecture makes it easy to add:

### New Commands
```typescript
// commands/balance.ts - Check token balances
// commands/history.ts - View transaction history
// commands/cancel.ts - Cancel pending swaps
```

### Enhanced Features
```typescript
// lib/config.ts - Configuration management
// lib/cache.ts - Response caching
// lib/analytics.ts - Usage analytics
```

### Advanced Options
```bash
# Batch operations
fx-cli batch --file swaps.json

# Different output formats
fx-cli list-tokens --format json

# Advanced swap options
fx-cli swap --slippage 0.5 --deadline 300
```

## ✅ Migration Checklist

- [x] Extract core FX client logic into reusable class
- [x] Create separate command files for each major function
- [x] Add CLI infrastructure with yargs
- [x] Implement environment variable support
- [x] Add comprehensive error handling
- [x] Create user-friendly help and examples
- [x] Add faucet functionality for complete development workflow
- [x] Document all features and usage patterns
- [x] Provide migration examples and comparison

The transformation from a single-purpose test function to a comprehensive CLI tool demonstrates how modular architecture, user experience focus, and proper tooling can dramatically improve software usability and maintainability.