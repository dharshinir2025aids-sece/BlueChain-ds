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

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <Card className="glass-panel border-border/60">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Create account</CardTitle>
        <CardDescription>
          Register for a role-based workspace. Full onboarding arrives in Phase 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Full name
          </label>
          <Input id="name" placeholder="Your name" disabled className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@organization.in"
            disabled
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled
            className="rounded-xl"
          />
        </div>
        <Button className="w-full rounded-full" disabled>
          Register
        </Button>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="ml-1 hover:text-foreground">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
