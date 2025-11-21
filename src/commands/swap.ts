import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";

interface SwapOptions extends AuthOptions {
  from: string;
  to: string;
  amount: string;
  affinity?: "from" | "to";
}

export const command: string = "swap";
export const desc: string = "Execute a token swap";

export const builder = (yargs: any) =>
  yargs.options({
    ...authArguments,
    from: {
      type: "string",
      demandOption: true,
      describe: "Source token to swap from",
      alias: "f",
    },
    to: {
      type: "string",
      demandOption: true,
      describe: "Target token to swap to",
      alias: "t",
    },
    amount: {
      type: "string",
      demandOption: true,
      describe: "Amount to swap (can be in source or target token units)",
      alias: "A",
    },
    affinity: {
      type: "string",
      choices: ["from", "to"],
      default: "from",
      describe:
        "Which token the amount refers to ('from' or 'to'). Default is 'from'",
    },
  });

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    console.log(
      `Preparing to swap ${argv.amount} ${argv.affinity === "from" ? argv.from : argv.to}...`,
    );
    console.log(`   From: ${argv.from}`);
    console.log(`   To: ${argv.to}`);
    console.log(`   Amount: ${argv.amount} (${argv.affinity} token units)`);

    // Create user client from provided credentials
    console.log("\nAuthenticating...");
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);
    console.log("   User authenticated");

    // Create FX client
    console.log("Connecting to FX service...");
    const fxClient = createFXClient(argv.resolver, userClient);
    console.log("   Connected to FX service");

    // Execute the swap
    const result = await fxClient.executeSwap({
      from: argv.from,
      to: argv.to,
      amount: argv.amount,
      affinity: argv.affinity,
    });

    console.log("\nSwap completed successfully!");
    console.log(`   Exchange ID: ${result.exchangeID}`);
    console.log(
      `   Final conversion: ${result.estimate.convertedAmount} ${argv.to}`,
    );
    process.exit(0);
  } catch (error) {
    console.error(
      "\nSwap failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
