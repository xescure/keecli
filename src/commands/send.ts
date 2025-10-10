import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";
import * as KeetaNet from "@keetanetwork/keetanet-client";

interface SendOptions {
  passphrase: string;
  resolver?: string;
  token: string;
  recipient: string;
  amount: string;
}

export const command: string = "send <token> <recipient> <amount>";
export const desc: string = "Send tokens to another account";

export const builder = (yargs: any) =>
  yargs
    .positional("token", {
      describe: "Token ticker or address to send",
      type: "string",
      demandOption: true,
    })
    .positional("recipient", {
      describe: "Recipient account address",
      type: "string",
      demandOption: true,
    })
    .positional("amount", {
      describe: "Amount to send (in raw units)",
      type: "string",
      demandOption: true,
    })
    .options({
      passphrase: {
        type: "string",
        demandOption: true,
        describe: "User passphrase for authentication",
        alias: "p",
      },
      resolver: {
        type: "string",
        demandOption: false,
        describe:
          "Resolver account public key string (uses default if not provided)",
        alias: "r",
      },
    });

export const handler = async (argv: any): Promise<void> => {
  try {
    console.log(
      `📤 Sending ${argv.amount} ${argv.token} to ${argv.recipient}...`,
    );

    // Create user client from passphrase
    const userClient = await createUserClientFromPassphrase(argv.passphrase);

    // Create FX client for token registry lookup
    const fxClient = createFXClient(argv.resolver, userClient);

    // Get token registry to resolve ticker to address if needed
    const tokens = await fxClient.listTokens();
    const tokenLookup = new Map(tokens.map((t) => [t.currency, t.token]));
    const reverseLookup = new Map(tokens.map((t) => [t.token, t.currency]));

    // Resolve token ticker to address if needed
    let tokenAddress = argv.token;
    let displayToken = argv.token;

    if (tokenLookup.has(argv.token)) {
      // Input is a ticker, resolve to address
      tokenAddress = tokenLookup.get(argv.token)!;
      displayToken = `${argv.token} (${tokenAddress})`;
    } else if (reverseLookup.has(argv.token)) {
      // Input is already an address, get ticker if available
      const ticker = reverseLookup.get(argv.token);
      displayToken = ticker ? `${ticker} (${tokenAddress})` : tokenAddress;
    }

    console.log(`   Token: ${displayToken}`);
    console.log(`   Amount: ${argv.amount}`);
    console.log(`   Recipient: ${argv.recipient}`);

    // Convert amount to BigInt
    const amount = BigInt(argv.amount);

    // Create recipient account object
    const recipientAccount = KeetaNet.lib.Account.fromPublicKeyString(
      argv.recipient,
    );

    // Send tokens directly
    console.log("📡 Sending transaction...");
    await userClient.send(recipientAccount, amount, tokenAddress);

    console.log("✅ Transfer completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error sending tokens:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
