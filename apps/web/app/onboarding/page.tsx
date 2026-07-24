import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container flex-1 py-12">
        <PageHeader
          eyebrow="Setup"
          title="Onboarding"
          description="Complete profile, organization, and wallet binding (Phase 2)."
        />
        <PlaceholderPanel
          title="Onboarding steps"
          description="Profile → organization → wallet connect."
        />
      </main>
      <PublicFooter />
    </div>
  );
}
