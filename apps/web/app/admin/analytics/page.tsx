import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Analytics" };

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="National analytics" description="Recharts dashboards in Phase 9." />
      <PlaceholderPanel title="Charts" description="Sequestration, supply, and SLA charts." />
    </DashboardShell>
  );
}
