import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { superNav } from "@/lib/site";

export const metadata = { title: "System logs" };

export default function SuperLogsPage() {
  return (
    <DashboardShell title="Platform Ops" roleLabel="Super Admin" nav={superNav}>
      <PageHeader title="System logs" description="Operational audit stream placeholder." />
      <PlaceholderPanel title="Logs" description="API and job logs will stream here." />
    </DashboardShell>
  );
}
