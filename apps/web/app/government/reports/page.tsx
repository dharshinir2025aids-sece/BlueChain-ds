import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { governmentNav } from "@/lib/site";

export const metadata = { title: "Government Reports" };

export default function GovernmentReportsPage() {
  return (
    <DashboardShell
      title="Government Oversight"
      roleLabel="Government Officer"
      nav={governmentNav}
    >
      <PageHeader
        title="Oversight reports"
        description="Quarterly sequestration summaries and national climate commitment progress."
      />
      <PlaceholderPanel
        title="Report exports"
        description="Downloadable briefings and programme summary reports."
      />
    </DashboardShell>
  );
}
