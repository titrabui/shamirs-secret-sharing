import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { NonceManager } from "@ethersproject/experimental";

export function GetSignerFromEnv(privKey: string, rpcURL: string | undefined, trackNonce: boolean = true): Signer | Wallet {
  if (!privKey) {
    throw new Error(`private key is not valid`);
  }

  const rpcProvider = rpcURL ? new JsonRpcProvider(rpcURL) : new JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const wallet = new Wallet(privKey, rpcProvider);

  if (trackNonce) return new NonceManager(wallet);
  return wallet.connect(rpcProvider);
}
