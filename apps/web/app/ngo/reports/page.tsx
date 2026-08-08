import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Reports" };

export default function NgoReportsPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Monitoring reports"
        description="Compile, submit, and track MRV monitoring reports for your projects."
      />
      <PlaceholderPanel
        title="Reports"
        description="Report list with status indicators — draft, submitted, in verification, and approved."
      />
    </DashboardShell>
  );
}
