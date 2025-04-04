"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import { PublicKey } from "@solana/web3.js";
import {
  createSolTransferTransaction,
  createTokenTransferTransaction,
} from "@/lib/transaction/createTransaction";

const isSolanaAddressValid = (address: string) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [token, setToken] = useState<"sol" | "usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);

  async function handleOnTransfer() {
    if (
      wallet == null ||
      token == null ||
      type !== "solana-smart-wallet" ||
      recipient == null ||
      amount == null
    ) {
      return;
    }

    // Validate Solana recipient address
    if (token === "sol" && !isSolanaAddressValid(recipient)) {
      alert("Invalid Solana recipient address");
      return;
    }

    try {
      setIsLoading(true);
      const crossmintWalletAddress = wallet.getAddress();
      function buildTransaction() {
        return token === "sol"
          ? createSolTransferTransaction(
              crossmintWalletAddress,
              recipient as string,
              amount as number
            )
          : createTokenTransferTransaction(
              crossmintWalletAddress,
              recipient as string,
              "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC token mint
              amount as number
            );
      }

      const txn = await buildTransaction();
      const txnHash = await wallet.sendTransaction({
        transaction: txn,
      });

      setTimeout(() => {
        setTxnHash(`https://solscan.io/tx/${txnHash}?cluster=devnet`);
      }, 3000);
    } catch (err) {
      console.error("Something went wrong", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white flex flex-col rounded-xl border shadow-sm">
      <div className="p-5 pb-0">
        <h2 className="text-lg font-medium">Transfer funds</h2>
        <p className="text-sm text-gray-500">Send funds to another wallet</p>
      </div>
      <div className="p-5">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Recipient wallet</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Enter wallet address"
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Token</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "sol"}
                  onChange={() => setToken("sol")}
                />
                <span>SOL</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="token"
                  className="h-4 w-4"
                  checked={token === "usdc"}
                  onChange={() => setToken("usdc")}
                />
                <span>USDC</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="0.00"
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="p-5 pt-0">
        <div className="flex flex-col gap-2 w-full">
          <button
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-accent text-white hover:bg-accent/80"
            }`}
            onClick={handleOnTransfer}
            disabled={isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </button>
          {txnHash && (
            <a
              href={txnHash}
              className="text-sm text-gray-500 text-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Solscan.io
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
