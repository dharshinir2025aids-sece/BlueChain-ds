import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        <PageHeader
          eyebrow="Team"
          title="Contact"
          description="Reach the BlueChain MRV team for demo access and SIH inquiries."
        />
        <PlaceholderPanel
          title="Contact form"
          description="Structured inquiry form will be wired in a later phase."
        />
      </div>
    </div>
  );
}
