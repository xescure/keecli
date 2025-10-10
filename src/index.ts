#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Import commands
import * as listTokens from "./commands/list-tokens.js";
import * as listConversions from "./commands/list-conversions.js";
import * as swap from "./commands/swap.js";
import * as faucet from "./commands/faucet.js";
import * as balance from "./commands/balance.js";
import * as send from "./commands/send.js";
import * as receive from "./commands/receive.js";

async function main() {
  const cli = yargs(hideBin(process.argv))
    .scriptName("fx-cli")
    .usage("$0 <command> [options]")
    .version("1.0.0")
    .help("h")
    .alias("h", "help")
    .demandCommand(1, "You must specify a command")
    .strict()
    .env("FX_CLI")
    .wrap(Math.min(120, process.stdout.columns || 80));

  // Register commands
  cli
    .command(listTokens)
    .command(listConversions)
    .command(swap)
    .command(faucet)
    .command(balance)
    .command(send)
    .command(receive);

  // Add examples
  cli
    .example(
      '$0 list-tokens -p "my passphrase"',
      "List all available tokens (uses default resolver)",
    )
    .example(
      '$0 list-tokens -p "my passphrase" -r "0x06..."',
      "List all available tokens with custom resolver",
    )
    .example(
      '$0 list-conversions -p "my passphrase" -t "$TOKEN_A"',
      "List conversions from TOKEN_A",
    )
    .example(
      '$0 swap -p "my passphrase" -f "$TOKEN_A" -t "$TOKEN_B" -a "1000"',
      "Swap 1000 TOKEN_A to TOKEN_B",
    )
    .example('$0 faucet -p "my passphrase"', "Request test tokens from faucet")
    .example(
      '$0 balance -p "my passphrase"',
      "Show account balances for all tokens",
    )
    .example(
      '$0 send USDC recipient_address 1000 -p "my passphrase"',
      "Send 1000 USDC tokens to recipient",
    )
    .example(
      '$0 receive -p "my passphrase"',
      "Show your account address to receive tokens",
    );

  // Parse and execute
  await cli.parse();
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  console.error("❌ CLI Error:", error);
  process.exit(1);
});
