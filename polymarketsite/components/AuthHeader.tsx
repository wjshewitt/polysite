"use client";

import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function AuthHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <button
          onClick={() => router.push("/sign-in")}
          className="border border-border bg-card text-foreground hover:bg-muted transition-colors px-4 py-2 text-xs font-mono font-bold"
        >
          SIGN IN
        </button>
        <button
          onClick={() => router.push("/sign-up")}
          className="bg-success text-background hover:bg-success/90 transition-colors px-4 py-2 text-xs font-mono font-bold border border-success"
        >
          GET STARTED
        </button>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "font-mono",
              userButtonPopoverActionButton: "font-mono text-xs",
            },
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
    </div>
  );
}
