import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Reports" };

export default function NgoReportsPage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title="Monitoring reports" description="Compile and submit MRV reports." />
      <PlaceholderPanel title="Reports" description="Report list and status badges will appear here." />
    </DashboardShell>
  );
}
