"use client";

import * as React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

// Static sample notifications — in a real implementation these
// would be fetched from GET /v1/notifications.
const SAMPLE = [
  {
    id: "1",
    type: "REPORT_APPROVED",
    title: "MRV report approved",
    body: "Pichavaram Community Forest · Period Jan–Mar 2026",
    time: "12 min ago",
    read: false,
  },
  {
    id: "2",
    type: "VERIFICATION_REQUESTED",
    title: "Verification requested",
    body: "Mahanadi Estuary Revival · BC-2026-041",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "CREDIT_MINTED",
    title: "Credits minted",
    body: "4,200 tCO₂e · Sundarbans Delta Restoration",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "REPORT_CHANGES_REQUESTED",
    title: "Changes requested",
    body: "Pulicat Lake Revival · Period Oct–Dec 2025",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "CREDIT_TRANSFERRED",
    title: "Credit transfer completed",
    body: "1,800 tCO₂e transferred to buyer portfolio",
    time: "2 days ago",
    read: true,
  },
];

function typeColor(type: string) {
  if (type.includes("APPROVED") || type.includes("MINTED") || type.includes("TRANSFERRED"))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (type.includes("CHANGES") || type.includes("REQUESTED"))
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "bg-primary/10 text-primary";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState(SAMPLE);

  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <div className="min-h-screen surface-gradient">
      <div className="container max-w-2xl py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Notifications
              </h1>
              {unread > 0 ? (
                <Badge className="rounded-full bg-primary/10 text-primary">
                  {unread} new
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {user
                ? `Alerts for ${user.name}`
                : "In-app alerts for MRV status changes."}
            </p>
          </div>
          {unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={markAllRead}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          ) : null}
        </div>

        {/* Notification list */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>
              Events from your workspace over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {items.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex w-full items-start gap-4 px-6 py-4 text-left transition-colors duration-150 hover:bg-secondary/40",
                  !item.read && "bg-primary/[0.03]",
                )}
                onClick={() => markRead(item.id)}
                aria-label={item.read ? item.title : `Unread: ${item.title}`}
              >
                {/* Icon dot */}
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    typeColor(item.type),
                  )}
                  aria-hidden="true"
                >
                  <Bell className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        item.read
                          ? "font-medium text-foreground"
                          : "font-semibold text-foreground",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!item.read ? (
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="mt-2 h-1.5 w-1.5 shrink-0" aria-hidden="true" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
