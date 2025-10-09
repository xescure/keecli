import * as KeetaNet from "@keetanetwork/keetanet-client";
import https from "https";
import { URLSearchParams } from "url";

const FAUCET_URL = "https://faucet.test.keeta.com/";
const FAUCET_AMOUNT = 10; // Always request 10 tokens
const POLL_INTERVAL_MS = 2000; // 2 seconds between balance checks
const MAX_POLL_ATTEMPTS = 30; // Maximum 60 seconds of polling

/**
 * Simple KeetaNet Test Faucet Utility
 *
 * Static methods to request 10 test tokens for gas fees and optionally wait for them to arrive.
 */
export class FaucetClient {
  /**
   * Make a single faucet request for 10 tokens
   */
  static async requestTokens(
    account: InstanceType<typeof KeetaNet.lib.Account>,
  ): Promise<{ success: boolean; message: string }> {
    const address = account.publicKeyString.get();

    return new Promise((resolve) => {
      const postData = new URLSearchParams({
        address: address,
        amount: FAUCET_AMOUNT.toString(),
      }).toString();

      const options = {
        hostname: "faucet.test.keeta.com",
        port: 443,
        path: "/",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
          // "User-Agent": "KeetaNet-FX-Faucet/1.0",
        },
      };

      const req = https.request(options, (res) => {
        // We only care about the HTTP status, ignore response body
        const success =
          res.statusCode !== undefined &&
          res.statusCode >= 200 &&
          res.statusCode < 300;

        // Consume the response body to prevent memory leaks
        res.on("data", () => {});
        res.on("end", () => {
          resolve({
            success,
            message: success
              ? `Successfully requested ${FAUCET_AMOUNT} tokens for ${address}`
              : `Faucet request failed with status ${res.statusCode}`,
          });
        });
      });

      req.on("error", (error) => {
        resolve({
          success: false,
          message: `Network error: ${error.message}`,
        });
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Request tokens and wait for balance to increase
   */
  static async requestAndWaitForTokens(
    userClient: KeetaNet.UserClient,
    account: InstanceType<typeof KeetaNet.lib.Account>,
  ): Promise<{
    success: boolean;
    message: string;
    received?: bigint;
  }> {
    const address = account.publicKeyString.get();

    // Get initial balance
    let initialBalance: bigint;
    try {
      initialBalance = await userClient.balance(userClient.baseToken);
    } catch (error) {
      return {
        success: false,
        message: `Failed to get initial balance: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }

    // Request tokens
    const requestResult = await this.requestTokens(account);
    if (!requestResult.success) {
      return requestResult;
    }

    // Wait for balance to increase
    console.log(`⏳ Waiting for tokens to arrive at ${address}...`);
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      attempts++;

      try {
        const currentBalance = await userClient.balance(userClient.baseToken);
        const increase = currentBalance - initialBalance;

        if (increase > 0n) {
          return {
            success: true,
            message: `Successfully received ${increase} KTA tokens`,
            received: increase,
          };
        }
      } catch (error) {
        // Continue polling even if balance check fails
      }
    }

    return {
      success: false,
      message: `Timeout waiting for funds after ${(MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000} seconds`,
    };
  }
}
