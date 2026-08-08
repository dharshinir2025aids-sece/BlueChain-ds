import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "ESG Reports" };

export default function BuyerReportsPage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <PageHeader
        title="ESG reports"
        description="Retirement certificates and downloadable ESG impact summaries."
      />
      <PlaceholderPanel
        title="Certificates"
        description="Downloadable PDF retirement certificates with on-chain proof links."
      />
    </DashboardShell>
  );
}
