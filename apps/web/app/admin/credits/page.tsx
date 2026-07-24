import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Admin credits" };

export default function AdminCreditsPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="Credit supply" description="National credit inventory controls." />
      <PlaceholderPanel title="Credits" description="Minted / retired supply tables." />
    </DashboardShell>
  );
}
