import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "NGO Credits" };

export default function NgoCreditsPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title="Credit portfolio" description="Organization-issued blue carbon credits." />
      <PlaceholderPanel title="Credits" description="Minted credit inventory will appear after Phase 8." />
    </DashboardShell>
  );
}
