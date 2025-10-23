"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthHeader } from "@/components/AuthHeader";

export function SiteHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/data-viz", label: "Analytics" },
    { href: "/test", label: "Test" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl font-mono font-bold hover:text-primary transition-colors"
            >
              betterPoly
            </Link>
          </div>

          {/* Center: Nav Links (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 font-mono text-sm transition-colors ${
                    isActive
                      ? "text-foreground font-bold border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Connection Status + Theme + Auth */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <ConnectionStatus />
            </div>
            <ThemeToggle />
            <AuthHeader />
          </div>
        </div>
      </div>
    </header>
  );
}
