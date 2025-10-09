import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";

interface SwapOptions {
  passphrase: string;
  resolver?: string;
  from: string;
  to: string;
  amount: string;
  affinity?: "from" | "to";
}

export const command: string = "swap";
export const desc: string = "Execute a token swap";

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
      alias: "a",
    },
    affinity: {
      type: "string",
      choices: ["from", "to"] as const,
      default: "from",
      describe:
        "Whether the amount is specified in source (from) or target (to) token units",
    },
  });

export const handler = async (argv: any): Promise<void> => {
  try {
    console.log(
      `🔄 Preparing to swap ${argv.amount} ${argv.affinity === "from" ? argv.from : argv.to}...`,
    );
    console.log(`   From: ${argv.from}`);
    console.log(`   To: ${argv.to}`);
    console.log(`   Amount: ${argv.amount} (${argv.affinity} token units)`);

    // Create user client from passphrase
    console.log("\n🔐 Authenticating...");
    const userClient = await createUserClientFromPassphrase(argv.passphrase);
    console.log("   ✅ User authenticated");

    // Create FX client
    console.log("🌐 Connecting to FX service...");
    const fxClient = createFXClient(argv.resolver, userClient);
    console.log("   ✅ Connected to FX service");

    // Execute the swap
    const result = await fxClient.executeSwap({
      from: argv.from,
      to: argv.to,
      amount: argv.amount,
      affinity: argv.affinity,
    });

    console.log("\n🎉 Swap completed successfully!");
    console.log(`   Exchange ID: ${result.exchangeID}`);
    console.log(
      `   Final conversion: ${result.estimate.convertedAmount} ${argv.to}`,
    );
    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Swap failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
