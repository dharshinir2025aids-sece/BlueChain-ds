import { PageHeader, PlaceholderPanel } from "@/components/page-header";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="container flex-1 py-12">
        <PageHeader title="Notifications" description="In-app alerts for MRV status changes." />
        <PlaceholderPanel title="Inbox" description="Notification feed arrives with workflows." />
      </main>
      <PublicFooter />
    </div>
  );
}
