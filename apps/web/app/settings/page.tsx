import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container flex-1 py-12">
        <PageHeader
          title="Settings"
          description="Account preferences and appearance."
          action={<ThemeToggle />}
        />
        <PlaceholderPanel
          title="Account"
          description="Profile editing and password change arrive in Phase 2."
        />
      </main>
      <PublicFooter />
    </div>
  );
}
