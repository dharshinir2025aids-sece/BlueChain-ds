import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { superNav } from "@/lib/site";

export const metadata = { title: "System logs" };

export default function SuperLogsPage() {
  return (
    <DashboardShell title="Platform Ops" roleLabel="Super Admin" nav={superNav}>
      <PageHeader
        title="System logs"
        description="Operational audit stream — API requests, job events, and error traces."
      />
      <PlaceholderPanel
        title="Logs"
        description="Structured API and background job logs with severity and correlation IDs."
      />
    </DashboardShell>
  );
}
