import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { adminNav } from "@/lib/site";

export const metadata = { title: "NCCR Admin" };

export default function AdminHomePage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <RoleDashboard role="admin" />
    </DashboardShell>
  );
}
