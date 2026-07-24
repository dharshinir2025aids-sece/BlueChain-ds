import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { verifierNav } from "@/lib/site";

export const metadata = { title: "Verification queue" };

export default function VerifierQueuePage() {
  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <PageHeader title="Pending packages" description="Verification queue list shell." />
      <PlaceholderPanel title="Queue" description="Assignable packages will list here." />
    </DashboardShell>
  );
}
