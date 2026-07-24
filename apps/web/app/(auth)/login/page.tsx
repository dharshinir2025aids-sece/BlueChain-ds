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

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="glass-panel border-border/60">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>
          Access your BlueChain MRV workspace. Authentication ships in Phase 2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          Sign in
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Create account
        </Link>
      </CardFooter>
    </Card>
  );
}
