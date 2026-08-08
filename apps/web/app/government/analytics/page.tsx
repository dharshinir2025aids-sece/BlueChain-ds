import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { governmentNav } from "@/lib/site";

export const metadata = { title: "Analytics" };

export default function GovernmentAnalyticsPage() {
  return (
    <DashboardShell
      title="Government Oversight"
      roleLabel="Government Officer"
      nav={governmentNav}
    >
      <PageHeader
        title="National analytics"
        description="Sequestration trends, verified hectares, and revenue across all states."
      />
      <PlaceholderPanel
        title="Analytics charts"
        description="State-level breakdown, time-series, and climate-target tracking."
      />
    </DashboardShell>
  );
}
