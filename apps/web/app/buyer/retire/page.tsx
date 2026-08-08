import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Retire credits" };

export default function BuyerRetirePage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader
        title="Retire credits"
        description="Irreversibly retire credits and generate ESG retirement certificates."
      />
      <PlaceholderPanel
        title="Retirement form"
        description="Select credits, enter a retirement reason, and trigger the on-chain retirement."
      />
    </DashboardShell>
  );
}
