import * as fs from "fs/promises";
import type { Arguments, CommandBuilder } from "yargs";
import { createUserClient } from "../lib/account.js";
import {
  authArguments,
  validateAuthArgs,
  getAuthOptions,
  AuthOptions,
} from "../lib/command-args.js";
import * as KeetaNet from "@keetanetwork/keetanet-client";
import * as AnchorClient from "@keetanetwork/anchor/client/index.js";

interface SetResolverMetadataOptions extends AuthOptions {
  jsonFile: string;
  account?: string;
}

export const command: string = "set-resolver-metadata <json-file>";
export const desc: string =
  "Set resolver metadata from a JSON file for the specified account";

export const builder = (yargs: any) =>
  yargs
    .positional("json-file", {
      describe: "Path to JSON file containing resolver metadata",
      type: "string",
      demandOption: true,
    })
    .options({
      ...authArguments,
      account: {
        ...authArguments.account,
        describe:
          "Account public key to set metadata for (uses signing account if not provided)",
      },
    });

export const handler = async (argv: any): Promise<void> => {
  try {
    validateAuthArgs(argv);

    const jsonFilePath: string = argv.jsonFile;

    console.log("--- Setting Resolver Metadata ---");
    console.log(`JSON file: ${jsonFilePath}`);

    console.log("\nReading metadata from JSON file...");
    let metadataJson: any;
    try {
      const fileContent = await fs.readFile(jsonFilePath, "utf-8");
      metadataJson = JSON.parse(fileContent);
      console.log("   ✓ JSON file parsed successfully");
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        throw new Error(`File not found: ${jsonFilePath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in file: ${error.message}`);
      }
      throw error;
    }

    console.log("\nMetadata:");
    console.log(JSON.stringify(metadataJson, null, 2));

    console.log("\nAuthenticating...");
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);
    console.log("   ✓ User authenticated");

    const targetAccount = argv.account
      ? KeetaNet.lib.Account.fromPublicKeyString(argv.account)
      : userClient.account;

    console.log(`\nTarget account: ${targetAccount.publicKeyString.get()}`);

    console.log("\nFormatting resolver metadata...");
    const formattedMetadata =
      AnchorClient.lib.Resolver.Metadata.formatMetadata(metadataJson);
    console.log("   ✓ Metadata formatted");

    const setInfoParams: any = {
      name: "",
      description: "",
      metadata: formattedMetadata,
    };

    if (targetAccount.isStorage()) {
      console.log(
        "   ℹ Account is a storage account, setting default permissions",
      );
      setInfoParams.defaultPermission = new KeetaNet.lib.Permissions([]);
    }

    console.log("\nUpdating account metadata...");
    await userClient.setInfo(setInfoParams, {
      account: targetAccount,
    });

    console.log("\n✅ Resolver metadata updated successfully!");
    console.log(`   Account: ${targetAccount.publicKeyString.get()}`);

    if (metadataJson.version) {
      console.log(`   Metadata version: ${metadataJson.version}`);
    }
    if (metadataJson.currencyMap) {
      const currencyCount = Object.keys(metadataJson.currencyMap).length;
      console.log(`   Currencies registered: ${currencyCount}`);
    }
    if (metadataJson.services) {
      const serviceTypes = Object.keys(metadataJson.services);
      console.log(`   Services configured: ${serviceTypes.join(", ")}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Failed to set resolver metadata:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
