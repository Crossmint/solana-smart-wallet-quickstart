import { CrossmintProvider } from "@/components/providers/crossmint";
import { PhantomProvider } from "@/components/providers/phantom";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  CreateWallet,
  // DelegatedSigner,
  FundWallet,
  TransferFunds,
  WalletBalance,
} from "@/components/wallet";

export default function Home() {
  return (
    <QueryProvider>
      <PhantomProvider>
        <CrossmintProvider>
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <CreateWallet />
            <WalletBalance />
            {/* <FundWallet />
            <TransferFunds /> */}
            {/* <DelegatedSigner /> */}
          </div>
        </CrossmintProvider>
      </PhantomProvider>
    </QueryProvider>
  );
}
