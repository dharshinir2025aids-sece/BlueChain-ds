import { PageHeader, PlaceholderPanel } from "@/components/page-header";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="surface-gradient">
      <div className="container py-14 sm:py-16">
        <PageHeader
          eyebrow="About"
          title="Enterprise climate infrastructure"
          description="BlueChain MRV is a blockchain-based blue carbon registry and Monitoring, Reporting & Verification platform designed for national-scale coastal climate programmes."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <PlaceholderPanel
            title="Mission"
            description="Enable trusted blue carbon accounting for mangroves, seagrass, and salt marshes with transparent MRV workflows."
          />
          <PlaceholderPanel
            title="SIH alignment"
            description="Built as a production-shaped prototype for Smart India Hackathon — ready for government stakeholder demos."
          />
        </div>
      </div>
    </div>
  );
}
