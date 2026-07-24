import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "Project" };

export default async function RegistryProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="container py-12">
      <PageHeader
        eyebrow="Public project"
        title={`Project ${projectId}`}
        description="Public project detail and on-chain proof links will render here."
      />
      <PlaceholderPanel
        title="Project dossier"
        description="Evidence summaries, GIS boundary, and credit history placeholders."
      />
    </div>
  );
}
