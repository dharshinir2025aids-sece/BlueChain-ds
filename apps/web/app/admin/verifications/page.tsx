import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Admin verifications" };

export default function AdminVerificationsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="Verification audits"
        description="Cross-check independent verifier decisions and authorize credit issuance."
      />
      <PlaceholderPanel
        title="Audits"
        description="Verification audit trail with decision history and status breakdown."
      />
    </DashboardShell>
  );
}
