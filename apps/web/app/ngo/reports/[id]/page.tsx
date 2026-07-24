import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Report" };

export default async function NgoReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title={`Report ${id}`} description="Report builder shell." />
      <PlaceholderPanel title="Report builder" description="Evidence pack assembly UI for Phase 6." />
    </DashboardShell>
  );
}
