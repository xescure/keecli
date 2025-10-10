import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";

interface ReceiveOptions extends AuthOptions {}

export const command: string = "receive";
export const desc: string = "Show your account address to receive tokens";

export const builder = (yargs: any) => yargs.options(authArguments);

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    console.log("Getting your account address...");

    // Create user client from provided credentials
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);

    // Get the account address
    const accountAddress = userClient.account.publicKeyString.get();

    console.log(`\nYour account address:`);
    console.log(`${accountAddress}`);
    console.log(`\nShare this address to receive tokens.`);

    process.exit(0);
  } catch (error) {
    console.error(
      "Error getting account address:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
