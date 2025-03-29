"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useCrossmint } from "../providers/crossmint";
import { PhantomProvider, usePhantom } from "../providers/phantom";

export function CreateWallet() {
  const {
    connect: connectPhantom,
    disconnect: disconnectPhantom,
    connected: phantomConnected,
    publicKey: phantomPublicKey,
    isInstalled: isPhantomInstalled,
    connecting: phantomConnecting,
    provider: phantomProvider,
  } = usePhantom();
  const {
    getOrCreateWallet,
    wallet,
    loading: crossmintLoading,
  } = useCrossmint();
  const isLoading = phantomConnecting || crossmintLoading;

  const handleOnPhantomConnect = async () => {
    try {
      if (phantomConnected) {
        await disconnectPhantom();
      }
      let publicKey = phantomPublicKey || (await connectPhantom());
      await getOrCreateWallet(
        publicKey as string,
        phantomProvider as PhantomProvider
      );
    } catch (err) {
      console.error(
        "Error connecting phantom wallet and creating solana smart wallet",
        err
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Create a wallet
        </CardTitle>
        <CardDescription>
          Connected your Phantom wallet to start using Solana.
        </CardDescription>
        {!isPhantomInstalled && (
          <div className="p-2 bg-yellow-100 border border-yellow-300 rounded-md text-xs">
            <p className="font-semibold">
              You don't have Phantom installed in your browser. Please install
              it to continue.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {phantomPublicKey != null && (
            <div className="flex items-center gap-2 p-1.5 rounded-lg border">
              <Image src="/phantom.svg" alt="Phantom" width={20} height={20} />
              <div className="overflow-hidden flex-grow">
                <div className="flex items-center">
                  <p className="text-xs text-muted-foreground truncate">
                    {phantomPublicKey}
                  </p>
                  <Button
                    className="w-4 h-4"
                    variant={"ghost"}
                    onClick={() =>
                      navigator.clipboard.writeText(phantomPublicKey)
                    }
                  >
                    <Copy className="w-2 h-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          {wallet != null && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-1.5 rounded-lg border">
                <Image
                  src="/crossmint.png"
                  alt="Crossmint"
                  width={20}
                  height={20}
                />
                <div className="overflow-hidden flex-grow">
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground truncate">
                      {wallet.address}
                    </p>
                    <Button
                      className="w-4 h-4"
                      variant={"ghost"}
                      onClick={() =>
                        navigator.clipboard.writeText(wallet.address)
                      }
                    >
                      <Copy className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-green-100 border border-green-300 rounded-md text-xs">
                Crossmint wallet fetched successfully with your Phantom wallet
                as admin signer.
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="w-full"
          variant={"outline"}
          onClick={handleOnPhantomConnect}
        >
          <Image
            src="/phantom.svg"
            alt="Phantom"
            width={24}
            height={24}
            className="rounded-sm"
          />
          {isLoading
            ? "Connecting..."
            : phantomConnected
            ? "Disconnect"
            : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
}
