import { auth, signIn, signOut } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  if (session?.user?.role === "organizer") {
    redirect(safeCallback);
  }

  if (session?.user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not an organizer</CardTitle>
            <CardDescription>
              You&apos;re signed in as{" "}
              <span className="font-medium text-foreground">
                {session.user.email}
              </span>
              , but this account is not on the{" "}
              <code className="text-xs">ORGANIZER_EMAILS</code> allowlist.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="secondary" className="w-full">
                Sign out
              </Button>
            </form>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex w-full justify-center",
              )}
            >
              Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Organizer sign in</CardTitle>
          <CardDescription>
            Sign in with Google. Only emails listed in{" "}
            <code className="text-xs">ORGANIZER_EMAILS</code> can access the
            dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: safeCallback });
            }}
          >
            <Button type="submit" className="w-full">
              Continue with Google
            </Button>
          </form>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex w-full justify-center",
            )}
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
