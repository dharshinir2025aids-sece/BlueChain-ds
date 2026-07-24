import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { ngoNav } from "@/lib/site";

export const metadata = { title: "NGO Dashboard" };

export default function NgoHomePage() {
  return (
    <DashboardShell title="NGO Console" roleLabel="NGO Manager" nav={ngoNav}>
      <RoleDashboard role="ngo" />
    </DashboardShell>
  );
}
