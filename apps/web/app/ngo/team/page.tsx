import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Team" };

export default function NgoTeamPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title="Field team" description="Assign field workers to projects." />
      <PlaceholderPanel title="Team roster" description="Member management arrives with auth in Phase 2." />
    </DashboardShell>
  );
}
