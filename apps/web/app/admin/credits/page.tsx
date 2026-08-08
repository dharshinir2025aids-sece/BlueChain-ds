import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Admin credits" };

export default function AdminCreditsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="Credit supply"
        description="National blue carbon credit inventory — minted, transferred, and retired."
      />
      <PlaceholderPanel
        title="Credits"
        description="Minted and retired supply tables linked to the blockchain module."
      />
    </DashboardShell>
  );
}
