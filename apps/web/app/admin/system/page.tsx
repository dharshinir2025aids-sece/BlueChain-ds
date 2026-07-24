import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "System" };

export default function AdminSystemPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="System health" description="API, AI, IPFS, and chain health indicators." />
      <PlaceholderPanel title="Health" description="Service status cards will poll live endpoints." />
    </DashboardShell>
  );
}
