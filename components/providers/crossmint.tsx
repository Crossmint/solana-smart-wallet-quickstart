"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  fetchCrossmintWallet,
  getCrossmintWalletBalance,
} from "@/app/actions/crossmint-server-sdk";
import { PhantomProvider } from "./phantom";
import { LightweightCrossmintWallet } from "@/types/wallet";

interface CrossmintContextType {
  wallet: LightweightCrossmintWallet | null;
  loading: boolean;
  error: string | null;
  getOrCreateWallet: (
    adminSignerAddress: string,
    phantomProvider: PhantomProvider
  ) => Promise<LightweightCrossmintWallet | null>;
  getWalletBalance: (
    walletAddress: string,
    phantomProvider: PhantomProvider
  ) => Promise<any>;
}

const CrossmintContext = createContext<CrossmintContextType | undefined>(
  undefined
);

export function CrossmintProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<LightweightCrossmintWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log({ CrossmintWallet: wallet });

  async function getOrCreateWallet(
    adminSignerAddress: string,
    phantomProvider: PhantomProvider
  ) {
    setLoading(true);
    setError(null);

    try {
      console.log("adminSignerAddress", adminSignerAddress);
      const walletRes = (await fetchCrossmintWallet(
        adminSignerAddress,
        phantomProvider,
        true
      )) as LightweightCrossmintWallet;

      console.log("walletRes", walletRes);
      setWallet(walletRes);
      return walletRes;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function getWalletBalance(
    walletAddress: string,
    phantomProvider: PhantomProvider
  ) {
    try {
      const balances = await getCrossmintWalletBalance(
        walletAddress,
        phantomProvider
      );
      return balances;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return null;
    }
  }

  const value = {
    wallet,
    loading,
    error,
    getOrCreateWallet,
    getWalletBalance,
  };

  return (
    <CrossmintContext.Provider value={value}>
      {children}
    </CrossmintContext.Provider>
  );
}

export function useCrossmint() {
  const context = useContext(CrossmintContext);
  if (context === undefined) {
    throw new Error("useCrossmint must be used within a CrossmintProvider");
  }
  return context;
}
