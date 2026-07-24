import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Field Project" };

export default async function FieldProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader title={`Project ${id}`} description="Field brief and plot map placeholder." />
      <PlaceholderPanel title="Project brief" description="Instructions and plot list will appear here." />
    </DashboardShell>
  );
}
