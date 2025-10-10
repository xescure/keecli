import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import { FaucetClient } from "../lib/faucet.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";

interface FaucetOptions extends AuthOptions {}

export const command: string = "faucet";
export const desc: string =
  "Request test tokens from the faucet and wait for them to arrive";

export const builder = (yargs: any) => {
  const faucetArgs = { ...authArguments };
  // Override network description to clarify test-only requirement
  faucetArgs.network = {
    ...authArguments.network,
    describe: "Network to connect to (faucet only works on 'test' network)",
    default: "test",
  };
  return yargs.options(faucetArgs);
};

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    // Validate that faucet only works on test network
    const authOptions = getAuthOptions(argv);
    if (authOptions.network !== "test") {
      console.error(
        `Error: Faucet is only available on the test network, but you specified: ${authOptions.network}`,
      );
      console.error(
        "Please use --network test or omit the network flag (defaults to test)",
      );
      process.exit(1);
    }

    console.log("Requesting tokens from faucet...");

    // Create user client from provided credentials
    console.log("Authenticating...");
    const userClient = await createUserClient(authOptions);
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
