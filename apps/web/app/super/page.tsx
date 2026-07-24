import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { superNav } from "@/lib/site";

export const metadata = { title: "Super Admin" };

export default function SuperHomePage() {
  return (
    <DashboardShell title="Platform Ops" roleLabel="Super Admin" nav={superNav}>
      <RoleDashboard role="super" />
    </DashboardShell>
  );
}
