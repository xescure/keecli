# FX CLI Features

A comprehensive overview of the FX CLI capabilities and features.

## 🚀 Core Features

### Four Main Commands
- **`list-tokens`** - Discover all available tokens from the resolver
- **`list-conversions`** - Find all possible conversions from a specific token
- **`swap`** - Execute token swaps with flexible amount specifications
- **`faucet`** - Request test tokens and automatically wait for delivery

### Environment Variable Support
- Uses `FX_CLI_` prefix for all environment variables
- Command line arguments override environment variables
- Reduces repetitive typing for common operations
- Secure credential management through environment variables

### Flexible Amount Handling
- **Source amount mode** (`--affinity from`): Specify amount in source token units
- **Target amount mode** (`--affinity to`): Specify amount in target token units
- Default is source amount mode for intuitive usage

## 📋 Command Details

### List Tokens
```bash
fx-cli list-tokens [options]
```
**Purpose**: Discover all tokens available through the resolver
**Requirements**: Passphrase, Resolver
**Output**: Formatted list of currency names and token addresses

### List Conversions
```bash
fx-cli list-conversions [options]
```
**Purpose**: Find what tokens can be converted from a source token
**Requirements**: Passphrase, Resolver, Source token
**Output**: JSON array of available conversion paths

### Swap
```bash
fx-cli swap [options]
```
**Purpose**: Execute a complete token swap transaction
**Requirements**: Passphrase, Resolver, From token, To token, Amount
**Process**: 
1. Get price estimates
2. Request firm quote
3. Create and submit exchange
4. Report transaction ID

**Features**:
- Automatic estimate acceptance (uses first available)
- Real-time progress reporting
- Support for both source and target amount specifications

### Faucet
```bash
fx-cli faucet [options]
```
**Purpose**: Request test tokens for development/testing
**Requirements**: Passphrase only
**Process**:
1. Get initial balance
2. Submit faucet request (10 KTA tokens)
3. Poll balance every 2 seconds
4. Wait up to 60 seconds for tokens
5. Report final balance increase

## 🛠️ Technical Features

### Modular Architecture
- **Commands**: Each command is self-contained in `src/commands/`
- **Libraries**: Reusable client code in `src/lib/`
- **Types**: Full TypeScript support with proper typing
- **Error Handling**: Comprehensive error catching and user-friendly messages

### Network Support
- Built on KeetaNetwork client libraries
- Support for test, main, staging, and dev networks
- Automatic account derivation from passphrases
- Resolver-based service discovery

### User Experience
- **Clear Progress Indicators**: Emoji-based status messages
- **Helpful Error Messages**: Context-aware error reporting  
- **Comprehensive Help**: Built-in help for all commands and options
- **Examples**: Real usage examples in help output

## 🔧 Environment Variables

All command line options can be set via environment variables:

| Environment Variable | Command Line Equivalent | Used By |
|---------------------|-------------------------|---------|
| `FX_CLI_PASSPHRASE` | `--passphrase, -p` | All commands |
| `FX_CLI_RESOLVER` | `--resolver, -r` | Most commands |
| `FX_CLI_FROM` | `--from, -f` | Swap |
| `FX_CLI_TO` | `--to, -t` | Swap |
| `FX_CLI_AMOUNT` | `--amount, -a` | Swap |
| `FX_CLI_TOKEN` | `--token, -t` | List conversions |
| `FX_CLI_AFFINITY` | `--affinity` | Swap |

### Priority Order
1. Command line arguments (highest priority)
2. Environment variables
3. Default values (lowest priority)

## 📦 Distribution Features

### Multiple Execution Methods
- **Direct Node**: `node dist/index.js <command>`
- **NPM Scripts**: `npm run dev -- <command>`
- **Shell Wrapper**: `./fx-cli.sh <command>` (recommended)

### Development Support
- **TypeScript**: Full TypeScript source code
- **Build System**: Automatic compilation to JavaScript
- **Hot Reload**: Development mode with automatic rebuilds
- **Testing**: Example scripts and environment variable testing

## 🔒 Security Features

### Credential Handling
- **Local Processing**: Passphrases processed locally only
- **No Persistence**: No sensitive data stored on disk
- **Environment Variables**: Secure credential management
- **Network Security**: All communication through official KeetaNetwork clients

### Error Safety
- **Safe Failures**: Commands fail gracefully without exposing sensitive data
- **Network Timeouts**: Reasonable timeouts prevent hanging
- **Input Validation**: Parameter validation before network requests

## 🌟 Advanced Features

### Automatic Service Discovery
- Uses resolver accounts to find available services
- Dynamic token and pair discovery
- No hardcoded service endpoints

### Balance Monitoring
- Real-time balance checking (faucet command)
- Automatic polling with configurable intervals
- Balance change detection and reporting

### Quote Management
- Automatic quote acceptance for simplified usage
- Real-time estimate fetching
- Signed quote handling for guaranteed rates

## 🎯 Use Cases

### Development & Testing
- **Faucet Integration**: Easy test token acquisition
- **Service Discovery**: Explore available tokens and pairs
- **Quick Testing**: Rapid swap testing with environment variables

### Production Trading
- **Automated Scripts**: Environment variable support for automation
- **Batch Operations**: Chain multiple commands together
- **Integration**: Easy integration into larger trading systems

### Learning & Exploration
- **Service Discovery**: Understand available trading pairs
- **Price Discovery**: Get real-time estimates
- **Network Exploration**: Learn KeetaNetwork FX ecosystem

## 📈 Extensibility

### Adding New Commands
1. Create new file in `src/commands/`
2. Implement command, desc, builder, and handler exports
3. Register in `src/index.ts`
4. Update documentation

### Custom Client Features
- Extend `FXClient` class in `src/lib/fx-client.ts`
- Add new methods for advanced trading features
- Maintain backward compatibility

### Configuration Extensions
- Add new environment variables following `FX_CLI_` pattern
- Update command builders to support new options
- Document in README and examples