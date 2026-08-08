import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "NGO Projects" };

export default function NgoProjectsPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Projects"
        description="Restoration projects managed by your organisation."
      />
      <PlaceholderPanel
        title="Project list"
        description="Create, manage, and track the status of your restoration programmes."
      />
    </DashboardShell>
  );
}
