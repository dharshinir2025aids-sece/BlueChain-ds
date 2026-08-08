import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="National analytics"
        description="Sequestration trends, supply metrics, and verification SLAs across the registry."
      />
      <PlaceholderPanel
        title="Charts"
        description="Sequestration time-series, credit supply, and verification throughput."
      />
    </DashboardShell>
  );
}
