import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { governmentNav } from "@/lib/site";

export const metadata = { title: "Government Officer Dashboard" };

export default function GovernmentHomePage() {
  return (
    <DashboardShell title="Government Oversight" roleLabel="Government Officer" nav={governmentNav}>
      <RoleDashboard role="government" />
    </DashboardShell>
  );
}