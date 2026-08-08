import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { governmentNav } from "@/lib/site";

export const metadata = { title: "Compliance" };

export default function GovernmentCompliancePage() {
  return (
    <DashboardShell
      title="Government Oversight"
      roleLabel="Government Officer"
      nav={governmentNav}
    >
      <PageHeader
        title="Compliance monitoring"
        description="Project compliance status against national restoration mandates."
      />
      <PlaceholderPanel
        title="Compliance dashboard"
        description="Exception reports, at-risk projects, and deadline tracking."
      />
    </DashboardShell>
  );
}
