import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { superNav } from "@/lib/site";

export const metadata = { title: "Contracts" };

export default function SuperContractsPage() {
  return (
    <DashboardShell title="Platform Ops" roleLabel="Super Admin" nav={superNav}>
      <PageHeader
        title="Contract registry"
        description="Deployed Polygon Amoy contract addresses for Registry, Credit, and Retirement."
      />
      <PlaceholderPanel
        title="Contracts"
        description="Registry, Credit, and Retirement contract addresses with ABI and deployment info."
      />
    </DashboardShell>
  );
}
