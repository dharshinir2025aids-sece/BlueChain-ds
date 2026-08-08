import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "New project" };

export default function NgoNewProjectPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Create project"
        description="Register a new coastal restoration project with boundary, methodology, and metadata."
      />
      <PlaceholderPanel
        title="Project wizard"
        description="Define boundary, ecosystem type, methodology, and assign field workers."
      />
    </DashboardShell>
  );
}
