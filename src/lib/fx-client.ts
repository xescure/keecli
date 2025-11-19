import * as AnchorClient from "@keetanetwork/anchor/client/index.js";
import * as KeetaNet from "@keetanetwork/keetanet-client";
import type {
  TokenAddress,
  GenericAccount,
} from "@keetanetwork/keetanet-client/lib/account.ts";

export interface FXClientOptions {
  resolverAccount?: any;
  userClient: KeetaNet.UserClient;
}

export interface TokenInfo {
  currency: string;
  token: string;
}

export interface SwapEstimate {
  from: string;
  to: string;
  amount: string;
  convertedAmount: string;
  getQuote: () => Promise<any>;
}

export interface SwapResult {
  exchangeID: string;
  estimate: SwapEstimate;
}

export class FXClient {
  private fxClient: any;
  private userClient: KeetaNet.UserClient;

  constructor(options: FXClientOptions) {
    this.userClient = options.userClient;
    this.fxClient = new AnchorClient.FX.Client(
      options.userClient as any,
      options.resolverAccount ? { root: options.resolverAccount as any } : {},
    );
  }

  /**
   * List all available tokens from the resolver
   */
  async listTokens(): Promise<TokenInfo[]> {
    try {
      const tokenList = await this.fxClient.resolver.listTokens();
      return tokenList.map((t: any) => ({
        currency: t.currency,
        token: t.token,
      }));
    } catch (error) {
      console.error("Error listing tokens:", error);
      return [];
    }
  }

  /**
   * Get possible conversions from a specific token
   */
  async listConversions(fromToken: string): Promise<any[]> {
    try {
      const response = await this.fxClient.listPossibleConversions({
        from: fromToken,
      });
      // Extract the conversions array from the response object
      return response.conversions || [];
    } catch (error) {
      console.error(`Error getting conversions for ${fromToken}:`, error);
      return [];
    }
  }

  /**
   * Get price estimates for a swap
   */
  async getEstimates(params: {
    from: string;
    to: string;
    amount: string;
    affinity?: "from" | "to";
  }): Promise<SwapEstimate[]> {
    try {
      const estimates = await this.fxClient.getEstimates({
        affinity: params.affinity || "from",
        amount: params.amount,
        from: params.from,
        to: params.to,
      });

      if (!estimates || estimates.length === 0) {
        throw new Error(
          `No estimates available for ${params.from} -> ${params.to}`,
        );
      }

      return estimates.map((est: any) => ({
        from: params.from,
        to: params.to,
        amount: params.amount,
        convertedAmount: est.estimate.convertedAmount,
        getQuote: () => est.getQuote(),
      }));
    } catch (error) {
      console.error("Error getting estimates:", error);
      throw error;
    }
  }

  /**
   * Execute a swap using the first available estimate
   */
  async executeSwap(params: {
    from: string;
    to: string;
    amount: string;
    affinity?: "from" | "to";
  }): Promise<SwapResult> {
    console.log(
      `\n--- Executing Swap: ${params.amount} ${params.from} -> ${params.to} ---`,
    );

    // Get estimates
    console.log("1. Getting price estimates...");
    const estimates = await this.getEstimates(params);
    const firstEstimate = estimates[0];

    if (!firstEstimate) {
      throw new Error("No estimates available for this swap");
    }

    console.log(`   ↳ Estimate: ${firstEstimate.convertedAmount} ${params.to}`);

    // Get quote
    console.log("2. Requesting firm quote...");
    const quoteWithProvider = await firstEstimate.getQuote();
    const quote = quoteWithProvider.quote;
    console.log(`   ↳ Quote signed by ${quote.account.publicKeyString.get()}`);
    console.log(`   ↳ Guaranteed conversion: ${quote.convertedAmount}`);

    // Execute swap
    console.log("3. Creating exchange...");
    const exchangeWithProvider = await quoteWithProvider.createExchange();
    const exchangeID = exchangeWithProvider.exchange.exchangeID;

    console.log("   ↳ Exchange accepted!");
    console.log(`   ↳ Transaction ID: ${exchangeID}`);

    return {
      exchangeID,
      estimate: firstEstimate,
    };
  }
}

/**
 * Create FX client from resolver string and user client
 */
export function createFXClient(
  resolverString: string | undefined,
  userClient: KeetaNet.UserClient,
): FXClient {
  const resolverAccount = resolverString
    ? KeetaNet.lib.Account.fromPublicKeyString(resolverString)
    : undefined;

  return new FXClient({
    resolverAccount,
    userClient,
  });
}
