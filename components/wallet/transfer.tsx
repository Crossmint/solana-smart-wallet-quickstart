"use client";

import { useState } from "react";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ChevronDown } from "lucide-react";
import { createTokenTransferTransaction } from "@/lib/transaction/createTransaction";
import { AuthenticatedCardContent } from "../ui/crossmint/auth-card-content";

export function TransferFunds() {
  const { wallet, type } = useWallet();
  const [token, setToken] = useState<"usdc" | null>(null);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [txnLink, setTxnLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const txn = await createTokenTransferTransaction(
        wallet.getAddress(),
        recipient,
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC on devnet
        amount
      );
      console.log({ txn });

      const signature = await wallet.sendTransaction({
        transaction: txn,
      });

      setTxnLink(`https://solscan.io/tx/${signature}?cluster=devnet`);
    } catch (err) {
      console.error("Something went wrong", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer funds</CardTitle>
        <CardDescription className="flex items-center gap-2">
          Send funds to another wallet
        </CardDescription>
      </CardHeader>
      <AuthenticatedCardContent>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <Label className="self-start">Recipient wallet</Label>
            <Input
              type="text"
              placeholder="Enter wallet address"
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-full">
              <Label>Token</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    {token || "Select token"}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setToken("usdc")}>
                    USDC
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <CardFooter className="p-0 flex mt-4 w-full">
          <Button
            className="w-full"
            onClick={handleOnTransfer}
            disabled={isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer"}
          </Button>
          {txnLink && (
            <a href={txnLink} target="_blank" rel="noopener noreferrer">
              View on Solscan
            </a>
          )}
        </CardFooter>
      </AuthenticatedCardContent>
    </Card>
  );
}
