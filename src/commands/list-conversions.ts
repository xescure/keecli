import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";

interface ListConversionsOptions extends AuthOptions {
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
    .options(authArguments);

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    console.log(`Discovering conversions from ${argv.token}...`);

    // Create user client from provided credentials
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);

    // Create FX client
    const fxClient = createFXClient(argv.resolver, userClient);

    // Get token registry for ticker lookup
    const tokens = await fxClient.listTokens();
    const tokenLookup = new Map(tokens.map((t) => [t.token, t.currency]));

    // List conversions
    const conversions = await fxClient.listConversions(argv.token);

    if (!Array.isArray(conversions) || conversions.length === 0) {
      console.log(`No conversions found for ${argv.token}`);
      process.exit(0);
    }

    const inputTicker = tokenLookup.get(argv.token);
    const displayToken = inputTicker
      ? `${inputTicker} (${argv.token})`
      : argv.token;

    console.log(
      `\nFound ${conversions.length} possible conversion(s) from ${displayToken}:`,
    );
    conversions.forEach((conversion, index) => {
      const ticker = tokenLookup.get(conversion);
      const displayConversion = ticker
        ? `${ticker} (${conversion})`
        : conversion;
      console.log(`${index + 1}. ${displayConversion}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(
      "Error listing conversions:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
