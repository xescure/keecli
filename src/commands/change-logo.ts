import * as fs from "fs/promises";
import * as path from "path";
import { createUserClient } from "../lib/account.js";
import {
  authArguments,
  getAuthOptions,
  validateAuthArgs,
} from "../lib/command-args.js";
import * as KeetaNet from "@keetanetwork/keetanet-client";

export const command: string = "change-logo <token> <logo>";
export const desc: string = "Update token account metadata with a logo";

export const builder = (yargs: any) =>
  yargs
    .positional("token", {
      describe: "Token account address to update",
      type: "string",
      demandOption: true,
    })
    .positional("logo", {
      describe:
        "Logo file path or URI (supports https:, data:, ipfs: protocols, or local file path)",
      type: "string",
      demandOption: true,
    })
    .options(authArguments);

export const handler = async (argv: any): Promise<void> => {
  try {
    // Validate authentication arguments
    validateAuthArgs(argv);

    const tokenAddress: string = argv.token;
    const logoInput: string = argv.logo;

    console.log("Processing logo update...");

    // Create user client from provided credentials
    const authOptions = getAuthOptions(argv);
    const userClient = await createUserClient(authOptions);

    // Create token account object
    const tokenAccount = KeetaNet.lib.Account.fromPublicKeyString(tokenAddress);
    console.log(`   Target account: ${tokenAccount.publicKeyString.get()}`);

    // Validate that the account is a token account
    console.log("Validating account is a token...");
    if (!tokenAccount.isToken) {
      throw new Error(
        "The account is not a token account. Only token accounts can have logo metadata.",
      );
    }
    console.log("   ✓ Account is a token");

    // Process logo input
    let logoURI: string;

    if (
      logoInput.startsWith("https:") ||
      logoInput.startsWith("ipfs:") ||
      logoInput.startsWith("data:")
    ) {
      // It's already a URI
      logoURI = logoInput;

      // Validate data: protocol format
      if (logoInput.startsWith("data:")) {
        const dataMatch = logoInput.match(
          /^data:image\/(png|jpeg|jpg|webp);base64,/,
        );
        if (!dataMatch) {
          throw new Error(
            "Invalid data: URI format. Must be data:image/png;base64,... or data:image/jpeg;base64,... or data:image/webp;base64,...",
          );
        }
      }

      console.log(
        `   Using provided URI: ${logoURI.substring(0, 50)}${logoURI.length > 50 ? "..." : ""}`,
      );
    } else {
      // It's a local file path - read and convert to base64
      console.log(`   Reading file: ${logoInput}`);

      try {
        const fileBuffer = await fs.readFile(logoInput);
        const base64Data = fileBuffer.toString("base64");

        // Determine MIME type from file extension
        const ext = path.extname(logoInput).toLowerCase();
        let mimeType: string;

        switch (ext) {
          case ".png":
            mimeType = "image/png";
            break;
          case ".jpg":
          case ".jpeg":
            mimeType = "image/jpeg";
            break;
          case ".webp":
            mimeType = "image/webp";
            break;
          default:
            throw new Error(
              `Unsupported file type: ${ext}. Supported types: .png, .jpg, .jpeg, .webp`,
            );
        }

        logoURI = `data:${mimeType};base64,${base64Data}`;
        console.log(`   Converted to base64 (${mimeType})`);
      } catch (error) {
        if ((error as any).code === "ENOENT") {
          throw new Error(`File not found: ${logoInput}`);
        }
        throw error;
      }
    }

    // Get current account info
    console.log("Fetching current account info...");
    const { info } = await userClient.client.getAccountInfo(tokenAccount);
    console.log(info);

    // Create updated metadata
    const payload = JSON.stringify({
      decimalPlaces: 0,
      logoURI: logoURI,
    });

    console.log("Updating account metadata...");

    // const payloadJson = {
    //   ...info,
    //   metadata: btoa(payload),
    // };
    // console.log(payloadJson);

    // Update account info with new metadata
    await userClient.setInfo(
      {
        ...info,
        metadata: btoa(payload),
      },
      { account: tokenAccount },
    );

    console.log("Logo updated successfully!");
    console.log(`   Account: ${tokenAccount.publicKeyString.get()}`);
    console.log(
      `   Logo URI: ${logoURI.substring(0, 100)}${logoURI.length > 100 ? "..." : ""}`,
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Error updating logo:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
