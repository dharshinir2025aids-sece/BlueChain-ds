import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "Documentation" };

export default function DocsPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        <PageHeader
          eyebrow="Learn"
          title="How BlueChain MRV works"
          description="Field capture → NGO reporting → verification → credit issuance → retirement."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <PlaceholderPanel
            title="MRV methodology"
            description="Monitoring protocols and evidence requirements for blue carbon projects."
          />
          <PlaceholderPanel
            title="Credit lifecycle"
            description="How mint, transfer, and retirement create an auditable impact trail."
          />
        </div>
      </div>
    </div>
  );
}
