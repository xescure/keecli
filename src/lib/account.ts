import * as KeetaNet from "@keetanetwork/keetanet-client";

/**
 * Create a user client from passphrase and network
 */
export async function createUserClientFromPassphrase(
  passphrase: string,
  network: "test" | "main" | "staging" | "dev" = "test",
): Promise<KeetaNet.UserClient> {
  const seed = await KeetaNet.lib.Account.seedFromPassphrase(passphrase);
  const account = KeetaNet.lib.Account.fromSeed(seed, 0);
  return KeetaNet.UserClient.fromNetwork(network, account);
}

/**
 * Create an account from a public key string (for resolver accounts)
 */
export function createAccountFromPublicKey(publicKeyString: string): any {
  return KeetaNet.lib.Account.fromPublicKeyString(publicKeyString);
}

/**
 * Get account address as string
 */
export function getAccountAddress(account: any): string {
  return account.address;
}
