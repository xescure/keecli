import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { FaucetClient } from "../lib/faucet.js";

interface FaucetOptions {
  passphrase: string;
}

export const command: string = "faucet";
export const desc: string =
  "Request test tokens from the faucet and wait for them to arrive";

export const builder = (yargs: any) =>
  yargs.options({
    passphrase: {
      type: "string",
      demandOption: true,
      describe: "User passphrase for authentication",
      alias: "p",
    },
  });

export const handler = async (argv: any): Promise<void> => {
  try {
    console.log("Requesting tokens from faucet...");

    // Create user client from passphrase
    console.log("Authenticating...");
    const userClient = await createUserClientFromPassphrase(argv.passphrase);
    console.log("   User authenticated");
    console.log(`   Account: ${userClient.account.publicKeyString.get()}`);

    // Request tokens and wait for them to arrive
    console.log("\nRequesting tokens from faucet...");
    const result = await FaucetClient.requestAndWaitForTokens(
      userClient,
      userClient.account,
    );

    if (result.success) {
      console.log("\nFaucet request completed successfully!");
      console.log(`   ${result.message}`);
      if (result.received) {
        console.log(`   Received: ${result.received} KTA tokens`);
      }
    } else {
      console.error(`\nFaucet request failed: ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "\nFaucet request failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
