import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";

interface ListConversionsOptions {
  passphrase: string;
  resolver?: string;
  token: string;
}

export const command: string = "list-conversions <token>";
export const desc: string =
  "List all possible conversions from a specific token";

export const builder = (yargs: any) =>
  yargs
    .positional("token", {
      describe: "Source token to find conversions from",
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
    console.log(`🔄 Discovering conversions from ${argv.token}...`);

    // Create user client from passphrase
    const userClient = await createUserClientFromPassphrase(argv.passphrase);

    // Create FX client
    const fxClient = createFXClient(argv.resolver, userClient);

    // List conversions
    const conversions = await fxClient.listConversions(argv.token);

    if (!Array.isArray(conversions) || conversions.length === 0) {
      console.log(`❌ No conversions found for ${argv.token}`);
      process.exit(0);
    }

    console.log(
      `\n✅ Found ${conversions.length} possible conversion(s) from ${argv.token}:`,
    );
    conversions.forEach((conversion, index) => {
      console.log(`${index + 1}. ${JSON.stringify(conversion, null, 2)}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error listing conversions:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
