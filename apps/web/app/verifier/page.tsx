import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { verifierNav } from "@/lib/site";

export const metadata = { title: "Verifier Dashboard" };

export default function VerifierHomePage() {
  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <RoleDashboard role="verifier" />
    </DashboardShell>
  );
}
