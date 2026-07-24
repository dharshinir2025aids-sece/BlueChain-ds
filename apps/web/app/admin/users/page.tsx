import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNav } from "@/lib/site";

export const metadata = { title: "Users" };

export default function AdminUsersPage() {
  return (
    <DashboardShell title="National Registry" roleLabel="NCCR Admin" nav={adminNav}>
      <PageHeader title="Users & roles" description="RBAC management shell for Phase 2." />
      <PlaceholderPanel title="User table" description="Invite, assign roles, and suspend accounts." />
    </DashboardShell>
  );
}
