import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Connect wallet" };

export default function WalletConnectPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Web3"
        title="Connect wallet"
        description="MetaMask binding arrives with auth in Phase 2 / chain work in Phase 8."
      />
      <PlaceholderPanel
        title="Wallet connector"
        description="ethers.js wallet connect UI will mount here."
      />
      <Button disabled className="w-full">
        Connect MetaMask
      </Button>
    </div>
  );
}
