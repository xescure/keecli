# KeeCLI

A command-line interface for trading on the Keeta Network Network.

## Installation

Install globally to use as a command-line tool:

```bash
npm install -g keecli
```

## Usage

### Authentication

All commands require authentication via either a passphrase or seed. You can provide credentials via:

**Passphrase Authentication:**
- Command line flag: `-p "your passphrase"`
- Environment variable: `export KEECLI_PASSPHRASE="your passphrase"`

**Seed Authentication:**
- Command line flag: `-s "your-seed-string"`
- Environment variable: `export KEECLI_SEED="your-seed-string"`

**Additional Options:**
- Network: `-n test|main|staging|dev` (default: test)
- Account offset: `-o 0` (default: 0)
- Custom resolver: `-r "resolver_address"`

### Commands

#### List Available Tokens
```bash
# With passphrase on test network (default)
keecli list-tokens -p "your passphrase"

# With seed on main network
keecli list-tokens -s "your-seed-string" -n main

# With passphrase, custom offset, and resolver
keecli list-tokens -p "your passphrase" -o 5 -r "custom_resolver_address"
```

#### List Token Conversions
```bash
# With passphrase
keecli list-conversions -p "your passphrase" -t "TOKEN_SYMBOL"

# With seed on staging network
keecli list-conversions -s "your-seed" -n staging -t "TOKEN_SYMBOL"
```

#### Execute Token Swap
```bash
# Basic swap with passphrase
keecli swap -p "your passphrase" -f "FROM_TOKEN" -t "TO_TOKEN" -a "1000"

# Swap with seed on main network, offset 3
keecli swap -s "your-seed" -n main -o 3 -f "FROM_TOKEN" -t "TO_TOKEN" -a "1000"
```

#### Check Account Balances
```bash
# With passphrase
keecli balance -p "your passphrase"

# With seed, offset 2, on main network
keecli balance -s "your-seed" -o 2 -n main
```

#### Send Tokens
```bash
# With passphrase
keecli send TOKEN_SYMBOL recipient_address amount -p "your passphrase"

# With seed on different network
keecli send TOKEN_SYMBOL recipient_address amount -s "your-seed" -n main
```

#### Get Receive Address
```bash
# With passphrase
keecli receive -p "your passphrase"

# With seed and custom offset
keecli receive -s "your-seed" -o 10
```

#### Request Test Tokens (Faucet)
```bash
# Faucet only works on test network
keecli faucet -p "your passphrase"
keecli faucet -s "your-seed" -o 5

# Note: Faucet will error if you try to use it on other networks
```

### Environment Variables

Set environment variables to avoid repeating common parameters:

```bash
# Authentication (choose one)
export KEECLI_PASSPHRASE="your passphrase"
export KEECLI_SEED="your-seed-string"

# Optional configuration
export KEECLI_NETWORK="main"
export KEECLI_OFFSET="5"
export KEECLI_RESOLVER="custom_resolver_address"

# Now you can run commands without flags
keecli list-tokens
keecli balance
```

### Global Options

**Authentication (required - choose one):**
- `-p, --passphrase`: Your account passphrase
- `-s, --seed`: Your account seed string

**Network Configuration (optional):**
- `-n, --network`: Network to connect to (test|main|staging|dev, default: test)
- `-o, --offset`: Account offset for seed derivation (default: 0)
- `-r, --resolver`: Custom resolver address

**General:**
- `-h, --help`: Show help
- `--version`: Show version

## Examples

```bash
# Check your balances with passphrase
keecli balance -p "my secure passphrase"

# List tokens using seed on main network
keecli list-tokens -s "my-seed-string" -n main

# Find conversions with offset account
keecli list-conversions -t "USDC" -p "my passphrase" -o 3

# Swap on staging network with seed
keecli swap -f "USDC" -t "ETH" -a "1000" -s "my-seed" -n staging

# Send using different account offset
keecli send USDC B62qn7... 500 -p "my passphrase" -o 2

# Get address for offset account 5
keecli receive -s "my-seed" -o 5

# Request test tokens (only works on test network)
keecli faucet -p "my passphrase"
```
