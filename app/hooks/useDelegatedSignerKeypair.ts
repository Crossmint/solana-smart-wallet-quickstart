"use client";

import { useState, useEffect } from "react";
import { Keypair } from "@solana/web3.js";

interface StoredKeypair {
  publicKey: string;
  secretKey: string;
}

export function useDelegatedSignerKeypair() {
  const [isLoading, setIsLoading] = useState(false);
  const [onError, setOnError] = useState<string | null>(null);
  const [delegatedSignerPubkey, setDelegatedSignerPubkey] = useState<
    string | null
  >(null);
  const [delegateSignerTxnLink, setDelegateSignerTxnLink] = useState<
    string | null
  >(null);

  useEffect(() => {
    const stored = localStorage.getItem("delegatedSignerKeypair");
    if (stored) {
      const parsed = JSON.parse(stored) as StoredKeypair;
      setDelegatedSignerPubkey(parsed.publicKey);
    }
  }, []);

  const generateKeypair = () => {
    const delegatedSignerKeypair = Keypair.generate();
    const keypairData = {
      publicKey: delegatedSignerKeypair.publicKey.toBase58(),
      secretKey: delegatedSignerKeypair.secretKey.toString(),
    };

    localStorage.setItem("delegatedSignerKeypair", JSON.stringify(keypairData));
    setDelegatedSignerPubkey(keypairData.publicKey);
    return delegatedSignerKeypair;
  };

  const clearKeypair = () => {
    localStorage.removeItem("delegatedSignerKeypair");
    setDelegatedSignerPubkey(null);
  };

  return {
    delegatedSignerPubkey,
    generateKeypair,
    clearKeypair,
    setDelegateSignerTxnLink,
    delegateSignerTxnLink,
    isLoading,
    setIsLoading,
    onError,
    setOnError,
  };
}
