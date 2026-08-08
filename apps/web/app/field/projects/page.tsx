import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Field Projects" };

export default function FieldProjectsPage() {
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader
        title="Assigned projects"
        description="Projects and plots assigned to you for monitoring and observation."
      />
      <PlaceholderPanel
        title="Project list"
        description="Your assigned projects with plot counts and pending observation tasks."
      />
    </DashboardShell>
  );
}
