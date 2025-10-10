import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";

interface ReceiveOptions {
  passphrase: string;
}

export const command: string = "receive";
export const desc: string = "Show your account address to receive tokens";

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
    console.log("Getting your account address...");

    // Create user client from passphrase
    const userClient = await createUserClientFromPassphrase(argv.passphrase);

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
