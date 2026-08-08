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
          title="Complete your profile"
          description="Finish setting up your account — organisation details and wallet binding."
        />
        <PlaceholderPanel
          title="Onboarding steps"
          description="Profile → organisation → wallet connect. Complete each step to unlock your workspace."
        />
      </main>
      <PublicFooter />
    </div>
  );
}
