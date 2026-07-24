import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { buyerNav } from "@/lib/site";

export const metadata = { title: "Buyer Dashboard" };

export default function BuyerHomePage() {
  return (
    <DashboardShell title="Buyer Portal" roleLabel="Corporate Buyer" nav={buyerNav}>
      <RoleDashboard role="buyer" />
    </DashboardShell>
  );
}
