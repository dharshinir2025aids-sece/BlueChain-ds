import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "New observation" };

export default function NewObservationPage() {
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader title="New observation" description="Field form shell — wired in Phase 4." />
      <PlaceholderPanel title="Observation form" description="Metrics, GPS, and media upload controls." />
    </DashboardShell>
  );
}
