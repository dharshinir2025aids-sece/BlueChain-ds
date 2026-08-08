import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "System" };

export default function AdminSystemPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="System health"
        description="Live status of the API, AI service, IPFS provider, and blockchain node."
      />
      <PlaceholderPanel
        title="Health"
        description="Service status cards polling live endpoints for API, AI, IPFS, and chain."
      />
    </DashboardShell>
  );
}
