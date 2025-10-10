import * as KeetaNet from "@keetanetwork/keetanet-client";

export type NetworkType = "test" | "main" | "staging" | "dev";

export interface AccountOptions {
  passphrase?: string;
  seed?: string;
  offset?: number;
  network?: NetworkType;
}

/**
 * Create a user client from passphrase or seed with optional offset and network
 */
export async function createUserClient(
  options: AccountOptions,
): Promise<KeetaNet.UserClient> {
  const {
    passphrase,
    seed: providedSeed,
    offset = 0,
    network = "test" as NetworkType,
  } = options;

  if (!passphrase && !providedSeed) {
    throw new Error("Either passphrase or seed must be provided");
  }

  if (passphrase && providedSeed) {
    throw new Error("Cannot provide both passphrase and seed - choose one");
  }

  let seed: any;
  if (passphrase) {
    seed = await KeetaNet.lib.Account.seedFromPassphrase(passphrase);
  } else {
    seed = providedSeed!;
  }

  const account = KeetaNet.lib.Account.fromSeed(seed, offset);
  return KeetaNet.UserClient.fromNetwork(network, account);
}

/**
 * Create a user client from passphrase and network (legacy function for backward compatibility)
 */
export async function createUserClientFromPassphrase(
  passphrase: string,
  network: NetworkType = "test",
  offset: number = 0,
): Promise<KeetaNet.UserClient> {
  return createUserClient({ passphrase, network, offset });
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
