import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { governmentNav } from "@/lib/site";

export const metadata = { title: "Programs" };

export default function GovernmentProgramsPage() {
  return (
    <DashboardShell
      title="Government Oversight"
      roleLabel="Government Officer"
      nav={governmentNav}
    >
      <PageHeader
        title="Blue carbon programs"
        description="National and state-level restoration program directives and targets."
      />
      <PlaceholderPanel
        title="Program registry"
        description="Active mandates, state allocations, and restoration targets."
      />
    </DashboardShell>
  );
}
