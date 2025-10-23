import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ConvexProvider } from "@/components/ConvexProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConsoleArt } from "@/components/ConsoleArt";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "betterPoly | Real-Time Market Intelligence for Prediction Markets",
  description:
    "Track live trades, analyze market depth, and make informed decisions with the most advanced Polymarket monitoring platform.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-sans antialiased`}
      >
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const STORAGE_KEY = "theme-storage";
  const DARK = "dark";
  const LIGHT = "light";
  const darkColor = "#0B0B0B";
  const lightColor = "#FFFFFF";

  try {
    const root = document.documentElement;
    let theme = DARK;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const persisted = parsed?.state?.theme;
      if (persisted === LIGHT || persisted === DARK) {
        theme = persisted;
      }
    } else if (window.matchMedia) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
    }

    root.classList.remove(LIGHT, DARK);
    root.classList.add(theme);
    root.style.colorScheme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === DARK ? darkColor : lightColor);
    }
  } catch (error) {
    console.warn("Theme initialization failed", error);
  }
})();`,
          }}
        />
        <ClerkProvider>
          <ConvexProvider>
            <ErrorBoundary>
              <ConsoleArt />
              <ThemeProvider>{children}</ThemeProvider>
            </ErrorBoundary>
          </ConvexProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
