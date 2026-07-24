import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Mint console" };

export default function AdminMintPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="Mint console" description="On-chain mint UI arrives in Phase 8." />
      <PlaceholderPanel title="Mint" description="Authorize and mint blue carbon certificates." />
    </DashboardShell>
  );
}
