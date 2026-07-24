import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "Project plots" };

export default async function NgoProjectPlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <PageHeader title={`Plots · ${id}`} description="Plot manager shell." />
      <PlaceholderPanel title="Plots" description="Plot table and map editor placeholders." />
    </DashboardShell>
  );
}
