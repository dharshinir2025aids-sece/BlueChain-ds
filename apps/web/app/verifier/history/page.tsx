import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { verifierNav } from "@/lib/site";

export const metadata = { title: "Verification history" };

export default function VerifierHistoryPage() {
  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <PageHeader title="Decision history" description="Past approvals and rejections." />
      <PlaceholderPanel title="History" description="Historical decisions will list here." />
    </DashboardShell>
  );
}
