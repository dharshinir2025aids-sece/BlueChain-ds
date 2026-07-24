import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Retire credits" };

export default function BuyerRetirePage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader title="Retire credits" description="Irreversible retirement for ESG claims." />
      <PlaceholderPanel title="Retirement form" description="On-chain retire flow in Phase 8–9." />
    </DashboardShell>
  );
}
