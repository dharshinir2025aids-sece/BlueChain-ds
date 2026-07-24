import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Authorize project" };

export default async function AdminAuthorizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title={`Authorize · ${id}`} description="Final authorization console." />
      <PlaceholderPanel title="Authorization" description="Approve mint eligibility for verified projects." />
    </DashboardShell>
  );
}
