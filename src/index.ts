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
import * as changeLogo from "./commands/change-logo.js";
import * as setResolverMetadata from "./commands/set-resolver-metadata.js";

async function main() {
  const cli = yargs(hideBin(process.argv))
    .scriptName("keecli")
    .usage("$0 <command> [options]")
    .version("1.0.0")
    .help("h")
    .alias("h", "help")
    .demandCommand(1, "You must specify a command")
    .strict()
    .env("KEECLI")
    .wrap(Math.min(120, process.stdout.columns || 80));

  // Register commands
  cli
    .command(listTokens)
    .command(listConversions)
    .command(swap)
    .command(faucet)
    .command(balance)
    .command(send)
    .command(receive)
    .command(changeLogo)
    .command(setResolverMetadata);

  // Add examples
  cli
    .example(
      '$0 list-tokens -p "my passphrase"',
      "List all available tokens with passphrase (test network)",
    )
    .example(
      '$0 list-tokens -s "my-seed-string" --network main',
      "List tokens with seed on main network",
    )
    .example(
      '$0 list-tokens -p "my passphrase" -o 5 -n staging',
      "List tokens with passphrase, offset 5, staging network",
    )
    .example(
      '$0 swap -p "my passphrase" -f "TOKEN_A" -t "TOKEN_B" -a "1000"',
      "Swap 1000 TOKEN_A to TOKEN_B",
    )
    .example(
      '$0 faucet -p "my passphrase"',
      "Request test tokens from faucet (test network only)",
    )
    .example(
      '$0 balance -s "seed" -o 3 --network main',
      "Show balances using seed with offset 3 on main network",
    )
    .example(
      '$0 send USDC recipient_address 1000 -p "my passphrase"',
      "Send 1000 USDC tokens to recipient",
    )
    .example(
      '$0 receive -p "my passphrase"',
      "Show your account address to receive tokens",
    )
    .example(
      '$0 change-logo TOKEN_ADDRESS ./logo.png -p "my passphrase"',
      "Update token metadata with a logo from a local file",
    )
    .example(
      '$0 change-logo TOKEN_ADDRESS "https://example.com/logo.png" -p "my passphrase"',
      "Update token metadata with a logo from a URL",
    )
    .example(
      '$0 set-resolver-metadata ./metadata.json -p "my passphrase"',
      "Set resolver metadata from a JSON file",
    )
    .example(
      '$0 set-resolver-metadata ./metadata.json -p "my passphrase" -a "B62qn7..."',
      "Set resolver metadata for a specific account",
    );

  // Parse and execute
  await cli.parse();
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Error: Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Error: Uncaught Exception:", error);
  process.exit(1);
});

// Run the CLI
main().catch((error) => {
  console.error("Error: CLI Error:", error);
  process.exit(1);
});
