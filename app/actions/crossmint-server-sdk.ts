"use server";

import { VersionedTransaction } from "@solana/web3.js";
import {
  CrossmintWallets,
  SolanaSmartWallet,
  createCrossmint,
} from "@crossmint/wallets-sdk";
import { PhantomProvider } from "@/components/providers/phantom";
import { LightweightCrossmintWallet } from "@/types/wallet";

const apiKey = process.env.CROSSMINT_SERVER_API_KEY;
if (!apiKey) {
  throw new Error("CROSSMINT_SERVER_API_KEY is not configured");
}
const crossmint = createCrossmint({ apiKey: apiKey as string });
const crossmintWallets = CrossmintWallets.from(crossmint);

export async function fetchCrossmintWallet(
  adminSignerAddress: string,
  phantomProvider: PhantomProvider,
  returnClientLightweightWallet: boolean = false
): Promise<SolanaSmartWallet | LightweightCrossmintWallet | null> {
  try {
    const wallet = await crossmintWallets.getOrCreateWallet(
      "solana-smart-wallet",
      {
        adminSigner: {
          address: adminSignerAddress,
          type: "solana-keypair",
          signer: {
            signMessage: async (message: Uint8Array<ArrayBufferLike>) => {
              return (await phantomProvider.signMessage(message, "utf8"))
                .signature;
            },
            signTransaction: async (transaction: VersionedTransaction) => {
              return await phantomProvider
                .signTransaction(transaction)
                .then((signature) => {
                  return signature.signature;
                });
            },
          },
        },
        linkedUser: `userId:${adminSignerAddress}`,
      }
    );

    return returnClientLightweightWallet
      ? ({
          address: wallet.getAddress(),
          adminSigner: wallet.adminSigner.address,
        } as LightweightCrossmintWallet)
      : wallet;
  } catch (err) {
    console.error("Error fetching Crossmint wallet:", err);
    return null;
  }
}

export async function getCrossmintWalletBalance(
  walletLocator: string,
  phantomProvider: PhantomProvider
) {
  try {
    const wallet = (await fetchCrossmintWallet(
      walletLocator,
      phantomProvider
    )) as SolanaSmartWallet;
    // Wait for the wallet to be ready from server
    if (!wallet) {
      console.log("Wallet not found or not ready");
      return { usdc: "0", sol: "0", error: "Wallet not ready" };
    }

    // Ensure wallet is fully initialized before proceeding
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log({ wallet });
    // const balanceData = await wallet.balances(["sol", "usdc"]);
    // console.log({ balanceData });
    return [];

    // const solBalance =
    //   balanceData?.find((t: any) => t.token === "sol")?.balances.total || "0";
    // const usdcBalance =
    //   balanceData?.find((t: any) => t.token === "usdc")?.balances.total || "0";
    // return { usdc: usdcBalance, sol: solBalance, error: null };
  } catch (err) {
    console.error("Error getting wallet balance:", err);
    return { usdc: "0", sol: "0", error: "Error getting wallet balance" };
  }
}
