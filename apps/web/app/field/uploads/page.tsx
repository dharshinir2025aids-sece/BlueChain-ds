import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Uploads" };

export default function FieldUploadsPage() {
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader title="Upload queue" description="Media sync queue placeholder." />
      <PlaceholderPanel title="Uploads" description="Pending and completed IPFS uploads will list here." />
    </DashboardShell>
  );
}
