import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Field Workspace" };

export default function FieldHomePage() {
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <RoleDashboard role="field" />
    </DashboardShell>
  );
}
