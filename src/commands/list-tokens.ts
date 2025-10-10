import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";

interface ListTokensOptions {
  passphrase: string;
  resolver?: string;
}

export const command: string = "list-tokens";
export const desc: string = "List all available tokens from the resolver";

export const builder = (yargs: any) =>
  yargs.options({
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
    console.log("Discovering available tokens...");

    // Create user client from passphrase
    const userClient = await createUserClientFromPassphrase(argv.passphrase);

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
