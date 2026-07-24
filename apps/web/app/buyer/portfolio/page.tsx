import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Portfolio" };

export default function BuyerPortfolioPage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader title="Portfolio" description="Owned credit inventory." />
      <PlaceholderPanel title="Holdings" description="Token holdings synced from chain/DB." />
    </DashboardShell>
  );
}
