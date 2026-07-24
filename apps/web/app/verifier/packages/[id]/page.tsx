import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { verifierNav } from "@/lib/site";

export const metadata = { title: "Verification package" };

export default async function VerifierPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardShell title="Verifier Desk" roleLabel="Independent Verifier" nav={verifierNav}>
      <PageHeader title={`Package ${id}`} description="Evidence review + AI panel shell." />
      <PlaceholderPanel title="Evidence review" description="Checklist, media, and AI flags placeholders." />
    </DashboardShell>
  );
}
