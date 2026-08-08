import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = { title: "Wallet settings" };

export default function WalletSettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container flex-1 py-12">
        <PageHeader
          title="Wallet"
          description="Bind or update the MetaMask wallet address linked to your account."
        />
        <PlaceholderPanel
          title="Wallet"
          description="Connect or unbind a MetaMask wallet for on-chain credit operations."
        />
      </main>
      <PublicFooter />
    </div>
  );
}
