import { auth, signOut } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="bg-card/80 border-b supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-foreground font-semibold">
            Unity Meetup
          </Link>
          {session?.user?.role === "organizer" ? (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "justify-center")}
            >
              Organizer login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
