import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <Card className="glass-panel border-border/70 shadow-lg">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Password reset flow is stubbed for Phase 1.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@organization.in" disabled />
        </div>
        <Button className="w-full" disabled>
          Send reset link
        </Button>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
