import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader
        title="Users & roles"
        description="Manage accounts, assign roles, and control access across the registry."
      />
      <PlaceholderPanel
        title="User table"
        description="Invite, assign roles, and suspend accounts via the auth API."
      />
    </DashboardShell>
  );
}
