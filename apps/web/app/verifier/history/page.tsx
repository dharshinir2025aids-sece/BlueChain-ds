import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { verifierNav } from "@/lib/site";

export const metadata = { title: "Verification history" };

export default function VerifierHistoryPage() {
  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <PageHeader
        title="Decision history"
        description="Your past verification approvals, rejections, and change requests."
      />
      <PlaceholderPanel
        title="History"
        description="Historical decisions with timestamps, rationale, and report references."
      />
    </DashboardShell>
  );
}
