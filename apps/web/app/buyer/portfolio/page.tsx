import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Portfolio" };

export default function BuyerPortfolioPage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader
        title="Portfolio"
        description="Your verified blue carbon credit holdings and transfer history."
      />
      <PlaceholderPanel
        title="Holdings"
        description="Token holdings with vintage year, ecosystem type, and on-chain provenance."
      />
    </DashboardShell>
  );
}
