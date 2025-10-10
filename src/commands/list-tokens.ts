import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";

interface ListTokensOptions extends AuthOptions {}

export const command: string = "list-tokens";
export const desc: string = "List all available tokens from the resolver";

export const builder = (yargs: any) => yargs.options(authArguments);

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    console.log("Discovering available tokens...");

    // Create user client from provided credentials
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);

    // Create FX client
    const fxClient = createFXClient(argv.resolver, userClient);

    // List tokens
    const tokens = await fxClient.listTokens();

    if (tokens.length === 0) {
      console.log("No tokens found");
      process.exit(0);
    }

    console.log(`\nFound ${tokens.length} token(s):`);
    tokens.forEach((token, index) => {
      console.log(`${index + 1}. ${token.currency} (${token.token})`);
    });
    process.exit(0);
  } catch (error) {
    console.error(
      "Error listing tokens:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
