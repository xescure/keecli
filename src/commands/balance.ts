import type { Arguments, CommandBuilder } from "yargs";
import { createUserClientFromPassphrase } from "../lib/account.js";
import { createFXClient } from "../lib/fx-client.js";

interface TokenMetadata {
  decimalPlaces?: number;
  [key: string]: any;
}

interface BalanceOptions {
  passphrase: string;
  resolver?: string;
}

export const command: string = "balance";
export const desc: string = "Show account balances for all tokens";

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
    console.log("💰 Fetching account balances...");

    // Create user client from passphrase
    const userClient = await createUserClientFromPassphrase(argv.passphrase);

    // Create FX client for token registry lookup
    const fxClient = createFXClient(argv.resolver, userClient);

    // Get token registry for ticker lookup
    const tokens = await fxClient.listTokens();
    const tokenLookup = new Map(tokens.map((t) => [t.token, t.currency]));

    // Get all balances
    const balances = await userClient.allBalances();

    if (!balances || balances.length === 0) {
      console.log("❌ No balances found");
      process.exit(0);
    }

    console.log(`\n✅ Account balances:`);

    // Helper function to format balance with decimals
    const formatBalance = async (
      tokenAddress: string,
      rawBalance: bigint,
    ): Promise<string> => {
      try {
        const tokenInfo = await userClient.client.getAccountInfo(tokenAddress);
        const tokenMetadata: TokenMetadata = JSON.parse(
          Buffer.from(tokenInfo.info.metadata, "base64").toString(),
        );

        const decimalPlaces = tokenMetadata.decimalPlaces || 0;
        const divisor = BigInt(10 ** decimalPlaces);
        const wholePart = rawBalance / divisor;
        const fractionalPart = rawBalance % divisor;

        if (fractionalPart === 0n) {
          return wholePart.toString();
        }

        const fractionalStr = fractionalPart
          .toString()
          .padStart(decimalPlaces, "0");
        const trimmedFractional = fractionalStr.replace(/0+$/, "");

        return trimmedFractional.length > 0
          ? `${wholePart.toString()}.${trimmedFractional}`
          : wholePart.toString();
      } catch (error) {
        // Fallback to raw balance if metadata fetch fails
        return rawBalance.toString();
      }
    };

    // Sort by ticker name for better readability
    const sortedBalances = balances.sort((a, b) => {
      const tokenAddressA = a.token.publicKeyString.get();
      const tokenAddressB = b.token.publicKeyString.get();
      const tickerA = tokenLookup.get(tokenAddressA) || tokenAddressA;
      const tickerB = tokenLookup.get(tokenAddressB) || tokenAddressB;
      return tickerA.localeCompare(tickerB);
    });

    for (const balanceEntry of sortedBalances) {
      const tokenAddress = balanceEntry.token.publicKeyString.get();
      const formattedBalance = await formatBalance(
        tokenAddress,
        balanceEntry.balance,
      );
      const ticker = tokenLookup.get(tokenAddress);
      const displayToken = ticker
        ? `${ticker} (${tokenAddress})`
        : tokenAddress;

      console.log(`• ${displayToken}: ${formattedBalance}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error fetching balances:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
};
