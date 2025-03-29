"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define the Phantom provider type
export interface PhantomProvider {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (
    message: Uint8Array,
    encoding: string
  ) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  request: (method: string, params: any) => Promise<any>;
}

interface PhantomContextType {
  provider: PhantomProvider | null;
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<string | undefined>;
  disconnect: () => Promise<void>;
  isInstalled: boolean;
}

const PhantomContext = createContext<PhantomContextType | undefined>(undefined);

export function PhantomProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const getProvider = (): PhantomProvider | null => {
        if ("phantom" in window) {
          const phantom = (window as any).phantom?.solana;
          if (phantom?.isPhantom) {
            setIsInstalled(true);
            return phantom;
          }
        }
        return null;
      };

      const provider = getProvider();
      setProvider(provider);

      // Check if already connected
      if ((provider as any)?.isConnected) {
        setConnected(true);
        setPublicKey((provider as any).publicKey?.toString() || null);
      }
    }
  }, []);

  const connect = async () => {
    if (!provider) {
      setError("Phantom wallet not installed");
      window.open("https://phantom.app/", "_blank");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const response = await provider.connect();
      setConnected(true);
      setPublicKey(response.publicKey.toString());
      return response.publicKey.toString();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to connect to Phantom wallet";
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (provider) {
      try {
        await provider.disconnect();
        setConnected(false);
        setPublicKey(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to disconnect from Phantom wallet";
        setError(errorMessage);
      }
    }
  };

  const value = {
    provider,
    connected,
    publicKey,
    connecting,
    error,
    connect,
    disconnect,
    isInstalled,
  };

  return (
    <PhantomContext.Provider value={value}>{children}</PhantomContext.Provider>
  );
}

export function usePhantom() {
  const context = useContext(PhantomContext);
  if (context === undefined) {
    throw new Error("usePhantom must be used within a PhantomProvider");
  }
  return context;
}
