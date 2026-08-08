import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fieldNav } from "@/lib/site";

export const metadata = { title: "Uploads" };

export default function FieldUploadsPage() {
  return (
    <DashboardShell title="Field Workspace" roleLabel="Field Worker" nav={fieldNav}>
      <PageHeader
        title="Upload queue"
        description="Media evidence pending sync to IPFS from your field device."
      />
      <PlaceholderPanel
        title="Uploads"
        description="Pending and completed IPFS uploads with CID confirmation status."
      />
    </DashboardShell>
  );
}
