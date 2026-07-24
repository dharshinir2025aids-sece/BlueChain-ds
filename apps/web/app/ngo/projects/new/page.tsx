import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "New project" };

export default function NgoNewProjectPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title="Create project" description="Project wizard shell for Phase 3." />
      <PlaceholderPanel title="Project wizard" description="Boundary draw, metadata, and methodology form." />
    </DashboardShell>
  );
}
