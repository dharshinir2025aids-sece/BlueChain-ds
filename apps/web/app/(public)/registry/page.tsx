import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "Public Registry" };

export default function RegistryPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        <PageHeader
          eyebrow="Transparency"
          title="Public Registry"
          description="Browse verified projects and credit lifecycle proofs. Live data wiring arrives in later phases."
        />
        <PlaceholderPanel
          title="Registry feed"
          description="Verified projects, credit status, and on-chain proof links will appear here."
        />
      </div>
    </div>
  );
}
