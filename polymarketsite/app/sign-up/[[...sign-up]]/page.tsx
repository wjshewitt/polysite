"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Dithering from "@/components/Dithering";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative overflow-hidden">
      {/* Dithering Background */}
      <div className="absolute inset-0 opacity-60">
        <Dithering />
      </div>

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background/90"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <nav className="border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-foreground hover:text-success transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xl font-bold">betterPoly</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Auth Container */}
            <div className="border border-border bg-background/90 backdrop-blur-sm p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  CREATE YOUR ACCOUNT
                </h1>
                <p className="text-sm text-muted-foreground">
                  Join professional traders on betterPoly
                </p>
              </div>

              {/* Clerk Component with custom styling */}
              <div className="clerk-auth-wrapper">
                <SignUp
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none border-0 p-0",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtonsBlockButton:
                        "border border-border bg-card text-foreground hover:bg-muted font-mono text-xs",
                      socialButtonsBlockButtonText: "font-mono text-xs",
                      dividerLine: "bg-border",
                      dividerText: "text-muted-foreground font-mono text-xs",
                      formFieldLabel: "font-mono text-xs text-foreground",
                      formFieldInput:
                        "border border-border bg-background text-foreground font-mono text-xs focus:border-buy",
                      formButtonPrimary:
                        "bg-buy hover:bg-buy/90 text-background font-mono text-xs font-bold",
                      footerActionLink: "text-success hover:text-success/80 font-mono",
                      identityPreviewText: "font-mono text-xs",
                      formFieldInputShowPasswordButton:
                        "text-muted-foreground hover:text-foreground",
                      footerActionText: "text-muted-foreground font-mono text-xs",
                    },
                  }}
                  afterSignUpUrl="/dashboard"
                  signInUrl="/sign-in"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 border border-border bg-background/80 backdrop-blur-sm p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By signing up, you agree to our Terms of Service and Privacy
                Policy. Your data is encrypted and secure.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border py-6 bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 betterPoly. Real-time prediction market intelligence.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
