import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "NGO Projects" };

export default function NgoProjectsPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title="Projects" description="Organization restoration projects." />
      <PlaceholderPanel title="Project list" description="Create and manage projects from Phase 3." />
    </DashboardShell>
  );
}
