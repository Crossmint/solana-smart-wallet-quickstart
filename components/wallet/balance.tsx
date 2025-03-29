"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCrossmint } from "../providers/crossmint";
import { AuthenticatedCard } from "../ui/crossmint/auth-card";
import { usePhantom } from "../providers/phantom";

export function WalletBalance() {
  const { wallet, getWalletBalance } = useCrossmint();
  const { provider: phantomProvider } = usePhantom();
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [solBalance, setSolBalance] = useState<string>("0");

  useEffect(() => {
    if (!wallet || !phantomProvider) return;
    getWalletBalance(wallet?.address, phantomProvider).then(
      ({ usdc, sol, error }) => {
        setUsdcBalance(usdc);
        setSolBalance(sol);
      }
    );
  }, [getWalletBalance, wallet?.address, phantomProvider]);

  const formatBalance = (balance: string, decimals: number) => {
    return (Number(balance) / Math.pow(10, decimals)).toFixed(2);
  };

  return (
    <AuthenticatedCard>
      <CardHeader>
        <CardTitle>Wallet balance</CardTitle>
        <CardDescription className="flex items-center gap-2">
          $
          {Number(formatBalance(usdcBalance, 6)) +
            Number(formatBalance(solBalance, 9))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/usdc.png" alt="USDC" width={24} height={24} />
              <p>USDC</p>
            </div>
            <div className="text-muted-foreground">
              $ {formatBalance(usdcBalance, 6)}
            </div>
          </div>
          <div className="border-t my-2"></div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Image src="/sol.svg" alt="Solana" width={24} height={24} />
              <p>Solana</p>
            </div>
            <div className="text-muted-foreground">
              {formatBalance(solBalance, 9)} SOL
            </div>
          </div>
        </div>
      </CardContent>
    </AuthenticatedCard>
  );
}
