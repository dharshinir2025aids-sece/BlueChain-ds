import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Admin projects" };

export default function AdminProjectsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="All projects" description="National project oversight." />
      <PlaceholderPanel title="Projects table" description="Filterable project registry." />
    </DashboardShell>
  );
}
