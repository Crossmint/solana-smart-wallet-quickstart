"use client";

import { useEffect, useState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { useDelegatedSignerKeypair } from "@/app/hooks/useDelegatedSignerKeypair";
import { AuthenticatedCard } from "../ui/crossmint/auth-card";
import { useCrossmint } from "../providers/crossmint";

export function DelegatedSigner() {
  const { wallet } = useCrossmint();
  const [delegateAddressInput, setDelegateAddressInput] = useState("");
  const {
    clearKeypair,
    delegatedSignerPubkey,
    generateKeypair,
    setIsLoading,
    isLoading,
    delegateSignerTxnLink,
    setDelegateSignerTxnLink,
    onError,
    setOnError,
  } = useDelegatedSignerKeypair();

  useEffect(() => {
    const fetchTransactions = async () => {
      const txns = await wallet?.transactions();
      console.log({ txns });
    };
    fetchTransactions();
  }, [wallet]);

  useEffect(() => {
    if (delegatedSignerPubkey) {
      setDelegateAddressInput(delegatedSignerPubkey);
    }
  }, [delegatedSignerPubkey]);

  const handleDelegateKey = async () => {
    setIsLoading(true);
    try {
      const response = await wallet.addDelegatedSigner(delegatedSignerPubkey);
      if (response.type === "solana-fireblocks-custodial") {
        setDelegateSignerTxnLink(
          `https://solscan.io/tx/${response.transaction.onChain.txId}?cluster=devnet`
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setOnError(err.message);
      } else {
        setOnError("Something went wrong adding delegated signer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticatedCard className="gap-3">
      <CardHeader>
        <CardTitle>Delegated Signer</CardTitle>
        <CardDescription>
          Create a delegated signer for your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {delegatedSignerPubkey != null ? (
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded-md text-xs">
            <p className="font-semibold">
              You have already generated a keypair.{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={clearKeypair}
              >
                Remove it
              </Button>
            </p>
            <p className="text-yellow-700 text-[11px] truncate">
              {delegatedSignerPubkey}
            </p>
          </div>
        ) : (
          <Button onClick={generateKeypair}>1. Generate Keypair</Button>
        )}

        {onError && (
          <div className="p-2 bg-red-100 border border-red-300 rounded-md text-xs">
            <p className="font-semibold">Error: {onError}</p>
          </div>
        )}

        {delegatedSignerPubkey != null && (
          <div className="flex flex-col gap-2 w-full">
            {delegateSignerTxnLink && (
              <div className="flex flex-col gap-2 w-full">
                <div className="p-2 bg-yellow-100 border border-yellow-300 rounded-md text-xs">
                  <p className="font-semibold">
                    Great! You have created a delegated signer. Now you can
                    transfer funds to it using the "Transfer funds" card to the
                    left.
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  <a
                    href={delegateSignerTxnLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Solscan
                  </a>
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              <Label>Delegate Address</Label>
              <Input
                placeholder="Enter delegate wallet address"
                value={delegateAddressInput}
                onChange={(e) => setDelegateAddressInput(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleDelegateKey}
              disabled={!delegateAddressInput || isLoading}
            >
              {isLoading ? "Creating..." : "Create Delegate Signer"}
            </Button>
          </div>
        )}
      </CardContent>
    </AuthenticatedCard>
  );
}
