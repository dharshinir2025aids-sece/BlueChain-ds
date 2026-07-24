import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Marketplace" };

export default function BuyerMarketplacePage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader title="Marketplace" description="Available blue carbon credits." />
      <PlaceholderPanel title="Listings" description="Marketplace cards arrive in Phase 9." />
    </DashboardShell>
  );
}
