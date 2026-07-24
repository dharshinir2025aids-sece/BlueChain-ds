import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "NGO Project" };

export default async function NgoProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title={`Project ${id}`} description="Project workspace overview." />
      <PlaceholderPanel title="Workspace" description="Plots, reports, and team activity placeholders." />
    </DashboardShell>
  );
}
