# FX CLI

A command-line interface for trading tokens on the KeetaNetwork FX platform.

## Installation

```bash
npm install
npm run build

# Or use the shell wrapper (makes running easier)
chmod +x fx-cli.sh
```

## Usage

The FX CLI provides four main commands for interacting with the FX trading platform.

### Running the CLI

You can run the CLI in several ways:

```bash
# Using npm scripts
npm run dev -- <command> [options]

# Using the built version
node dist/index.js <command> [options]

# Using the shell wrapper (recommended)
./fx-cli.sh <command> [options]
```

### Environment Variables

The CLI supports environment variables with the `FX_CLI_` prefix. This makes it easier to avoid repeating common options:

```bash
# Set environment variables
export FX_CLI_PASSPHRASE="your secret passphrase"
export FX_CLI_RESOLVER="0x06abc123..."
export FX_CLI_FROM="$TOKEN_A"
export FX_CLI_TO="$TOKEN_B"
export FX_CLI_AMOUNT="1000"

# Now you can run commands without flags
fx-cli list-tokens
fx-cli swap
fx-cli faucet
```

See `example.env` for a complete list of supported environment variables.

### Global Options

- `-p, --passphrase <passphrase>`: Your user passphrase for authentication (required)
- `-r, --resolver <resolver>`: Resolver account public key string (required for most commands)

### Commands

#### 1. List Tokens

List all available tokens from the resolver:

```bash
fx-cli list-tokens -p "your passphrase" -r "0x06..."
# Or with environment variables:
fx-cli list-tokens
```

#### 2. List Conversions

Discover all possible conversions from a specific token:

```bash
fx-cli list-conversions -p "your passphrase" -r "0x06..." -t "$TOKEN_A"
# Or with environment variables:
fx-cli list-conversions
```

Options:
- `-t, --token <token>`: Source token to find conversions from

#### 3. Swap

Execute a token swap:

```bash
fx-cli swap -p "your passphrase" -r "0x06..." -f "$TOKEN_A" -t "$TOKEN_B" -a "1000"
# Or with environment variables:
fx-cli swap
```

Options:
- `-f, --from <token>`: Source token to swap from
- `-t, --to <token>`: Target token to swap to
- `-a, --amount <amount>`: Amount to swap
- `--affinity <from|to>`: Whether the amount is in source or target token units (default: "from")

#### 4. Faucet

Request test tokens from the faucet and wait for them to arrive:

```bash
fx-cli faucet -p "your passphrase"
# Or with environment variables:
fx-cli faucet
```

This command automatically:
- Requests the default amount (10 KTA tokens)
- Polls your balance every 2 seconds
- Waits up to 60 seconds for the tokens to arrive
- Reports the final balance increase

### Examples

#### With Command Line Arguments

```bash
# List all available tokens
fx-cli list-tokens -p "my secret passphrase" -r "0x06abc123..."

# Find what tokens you can convert TOKEN_A to
fx-cli list-conversions -p "my secret passphrase" -r "0x06abc123..." -t "$TOKEN_A"

# Swap 1000 TOKEN_A for TOKEN_B
fx-cli swap -p "my secret passphrase" -r "0x06abc123..." -f "$TOKEN_A" -t "$TOKEN_B" -a "1000"

# Swap to get exactly 500 TOKEN_B (specify target amount)
fx-cli swap -p "my secret passphrase" -r "0x06abc123..." -f "$TOKEN_A" -t "$TOKEN_B" -a "500" --affinity to

# Request test tokens from faucet
fx-cli faucet -p "my secret passphrase"
```

#### With Environment Variables

```bash
# Set up environment variables once
export FX_CLI_PASSPHRASE="my secret passphrase"
export FX_CLI_RESOLVER="0x06abc123..."

# Now run commands without repetitive flags
fx-cli list-tokens
fx-cli list-conversions --token "$TOKEN_A"
fx-cli swap --from "$TOKEN_A" --to "$TOKEN_B" --amount "1000"
fx-cli faucet

# Mix environment variables with command line overrides
export FX_CLI_FROM="$TOKEN_A"
export FX_CLI_TO="$TOKEN_B"
fx-cli swap --amount "2000"  # Override amount, use env vars for tokens
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run directly with TypeScript (rebuilds and runs)
npm run dev -- <command> [options]

# Build and run
npm run build && npm start -- <command> [options]

# Make shell wrapper executable
chmod +x fx-cli.sh
```

## Testing the CLI

Since this CLI interacts with the KeetaNetwork FX services, you'll need:

1. A valid passphrase for authentication
2. A resolver account public key string (from your FX service setup)
3. Valid token identifiers (like `$TOKEN_A`, `$TOKEN_B`)

You can test the CLI without making actual trades by using the `list-tokens` and `list-conversions` commands first to discover what's available.

## Architecture

The CLI is structured modularly:

- `src/index.ts`: Main CLI entry point using yargs with environment variable support
- `src/lib/`: Core libraries
  - `fx-client.ts`: FX trading client wrapper
  - `account.ts`: Account creation and management utilities  
  - `faucet.ts`: Faucet client for requesting test tokens
- `src/commands/`: Individual command implementations
  - `list-tokens.ts`: Token discovery command
  - `list-conversions.ts`: Conversion discovery command
  - `swap.ts`: Token swap execution command
  - `faucet.ts`: Faucet token request command

Each command is self-contained and can be easily extended or modified independently.

### Environment Variable Support

The CLI uses yargs' `.env()` method to automatically parse environment variables with the `FX_CLI_` prefix:
- `FX_CLI_PASSPHRASE` → `--passphrase`
- `FX_CLI_RESOLVER` → `--resolver`
- `FX_CLI_FROM` → `--from`
- `FX_CLI_TO` → `--to`
- `FX_CLI_AMOUNT` → `--amount`
- `FX_CLI_TOKEN` → `--token`
- `FX_CLI_AFFINITY` → `--affinity`

Command line arguments always take precedence over environment variables.

## Error Handling

The CLI provides clear error messages and uses emoji indicators:
- ✅ Success operations
- ❌ Errors and failures
- 🔍 Discovery operations
- 🔄 Processing operations
- 🔐 Authentication operations
- 🌐 Network operations
- 🎉 Completion messages

## Security

- Passphrases are processed locally and used to derive account keys
- No sensitive information is logged or persisted
- All network communication uses the KeetaNetwork client libraries

## Troubleshooting

### Common Issues

1. **"No estimates available"** - This usually means:
   - The token pair is not supported
   - Insufficient liquidity
   - Invalid token identifiers

2. **Authentication errors** - Check that:
   - Your passphrase is correct
   - The resolver account string is valid
   - You have network connectivity

3. **Build errors** - Try:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Debug Mode

For more verbose output, you can modify the source code to add additional logging or run with Node.js debugging:

```bash
node --inspect dist/index.js <command> [options]
```