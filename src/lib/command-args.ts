import type { Options } from "yargs";
import { NetworkType } from "./account.js";

export interface AuthOptions {
  passphrase?: string;
  seed?: string;
  offset?: number;
  network?: NetworkType;
  resolver?: string;
}

export const authArguments: Record<string, Options> = {
  passphrase: {
    type: "string",
    describe: "User passphrase for authentication (mutually exclusive with seed)",
    alias: "p",
  },
  seed: {
    type: "string",
    describe: "User seed for authentication (mutually exclusive with passphrase)",
    alias: "s",
  },
  offset: {
    type: "number",
    describe: "Account offset/index for seed derivation",
    alias: "o",
    default: 0,
  },
  network: {
    type: "string",
    describe: "Network to connect to",
    alias: "n",
    choices: ["test", "main", "staging", "dev"] as const,
    default: "test" as NetworkType,
  },
  resolver: {
    type: "string",
    describe: "Resolver account public key string (uses default if not provided)",
    alias: "r",
  },
};

export function validateAuthArgs(argv: AuthOptions): void {
  if (!argv.passphrase && !argv.seed) {
    throw new Error("Either --passphrase or --seed must be provided");
  }

  if (argv.passphrase && argv.seed) {
    throw new Error("Cannot provide both --passphrase and --seed - choose one");
  }
}

export function getAuthOptions(argv: AuthOptions) {
  return {
    passphrase: argv.passphrase,
    seed: argv.seed,
    offset: argv.offset || 0,
    network: argv.network || "test" as NetworkType,
  };
}
