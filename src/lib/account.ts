import * as KeetaNet from "@keetanetwork/keetanet-client";

export type NetworkType = "test" | "main" | "staging" | "dev";

export interface AccountOptions {
  passphrase?: string;
  seed?: string;
  offset?: number;
  network?: NetworkType;
  account?: string;
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
    account: accountPublicKey,
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

  const signingAccount = KeetaNet.lib.Account.fromSeed(seed, offset);

  let account: any;
  if (accountPublicKey) {
    account = KeetaNet.lib.Account.fromPublicKeyString(accountPublicKey);
  } else {
    account = signingAccount;
  }

  return KeetaNet.UserClient.fromNetwork(network, signingAccount, {
    account: account,
  });
}
