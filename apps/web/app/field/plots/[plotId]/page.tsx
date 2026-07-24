import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Plot" };

export default async function FieldPlotPage({
  params,
}: {
  params: Promise<{ plotId: string }>;
}) {
  const { plotId } = await params;
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader title={`Plot ${plotId}`} description="Plot detail and observation history." />
      <PlaceholderPanel title="Plot detail" description="Geometry, metrics, and media placeholders." />
    </DashboardShell>
  );
}
