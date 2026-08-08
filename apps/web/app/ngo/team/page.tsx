import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Team" };

export default function NgoTeamPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader
        title="Field team"
        description="Manage field workers and their project assignments."
      />
      <PlaceholderPanel
        title="Team roster"
        description="Invite members, assign roles, and manage project access."
      />
    </DashboardShell>
  );
}
