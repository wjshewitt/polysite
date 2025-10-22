"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  TrendingUp,
  Zap,
  Activity,
  BarChart3,
  Database,
  Terminal,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { ThemeToggle } from "./ThemeToggle";
import Dithering from "./Dithering";

export function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past hero section
      if (heroRef.current) {
        const heroBottom =
          heroRef.current.offsetTop + heroRef.current.offsetHeight;
        // Trigger when scrolling near the end of hero section
        setScrolled(window.scrollY > heroBottom - 200);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -10% 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up");
          entry.target.classList.remove("opacity-0", "translate-y-4");
        }
      });
    }, observerOptions);

    const elements = [
      featuresRef.current,
      showcaseRef.current,
      techRef.current,
      ctaRef.current,
    ];

    elements.forEach((el) => {
      if (el) {
        el.classList.add(
          "opacity-0",
          "translate-y-4",
          "transition-all",
          "duration-1000",
        );
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Navigation */}
      <nav
        className={`border-b fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-border bg-background/95 backdrop-blur-sm"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">betterPoly</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AuthHeader />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dithering Background */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-border -mt-16 pt-16"
      >
        {/* Dithering Background Layer */}
        <div className="absolute inset-0 -top-16 opacity-70">
          <Dithering />
        </div>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 -top-16 bg-gradient-to-b from-background/50 via-background/70 to-background"></div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-block px-3 py-1 mb-6 border border-muted-foreground text-muted-foreground text-xs bg-background/50 backdrop-blur-sm">
              REAL-TIME MARKET INTELLIGENCE
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
              PREDICTION MARKET
              <br />
              <span className="text-success">DATA TERMINAL</span>
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Live trade feeds // Order book depth analysis // Market monitoring
              <br />
              Built for traders who demand professional-grade tools
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGetStarted}
                className="group bg-success text-background px-6 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 hover:bg-success/90 border border-success"
              >
                ENTER DASHBOARD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleGetStarted}
                className="border border-border bg-background/50 backdrop-blur-sm text-foreground px-6 py-3 text-sm font-bold transition-all hover:bg-muted hover:border-muted-foreground"
              >
                VIEW LIVE DEMO
              </button>
            </div>

            {/* Stats Bar */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
              <div className="border border-border bg-background/50 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-success mb-1">
                  &lt;10ms
                </div>
                <div className="text-xs text-muted-foreground">AVG LATENCY</div>
              </div>
              <div className="border border-border bg-background/50 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-foreground mb-1">
                  100%
                </div>
                <div className="text-xs text-muted-foreground">REAL-TIME</div>
              </div>
              <div className="border border-border bg-background/50 backdrop-blur-sm p-4">
                <div className="text-2xl font-bold text-buy mb-1">24/7</div>
                <div className="text-xs text-muted-foreground">MONITORING</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-16 sm:py-24 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-block px-3 py-1 mb-4 border border-border text-muted-foreground text-xs">
              CORE FEATURES
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">
              PROFESSIONAL TRADING TOOLS
            </h3>
            <p className="text-muted-foreground max-w-2xl">
              Everything you need to monitor and analyze prediction markets in
              real-time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="border border-border bg-card p-6 hover:border-success transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-success group-hover:text-background group-hover:border-success transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                WEBSOCKET STREAMING
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Zero-delay market data via persistent WebSocket connections. See
                every trade, bid, and ask as it happens on-chain.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-border bg-card p-6 hover:border-buy transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-buy group-hover:text-background group-hover:border-buy transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                ORDER BOOK DEPTH
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced visualization of market liquidity. Analyze bid/ask
                spreads and identify support/resistance levels instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-border bg-card p-6 hover:border-sell transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-sell group-hover:text-background group-hover:border-sell transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                LIVE TRADE FEED
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time trade stream with volume tracking, price movements,
                and market momentum indicators for all active markets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="border border-border bg-card p-6 hover:border-success transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-success group-hover:text-background group-hover:border-success transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                CLOB INTEGRATION
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct connection to Polymarket&apos;s Central Limit Order Book.
                Place, monitor, and manage orders programmatically.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="border border-border bg-card p-6 hover:border-buy transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-buy group-hover:text-background group-hover:border-buy transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                MARKET ANALYTICS
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track trending markets, volume leaders, and price volatility.
                Filter by category: crypto, politics, sports, entertainment.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="border border-border bg-card p-6 hover:border-sell transition-colors group">
              <div className="w-10 h-10 border border-muted-foreground text-muted-foreground flex items-center justify-center mb-4 group-hover:bg-sell group-hover:text-background group-hover:border-sell transition-colors">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground">
                DEVELOPER FIRST
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built with Next.js 15, TypeScript, and Zustand. Clean
                architecture, type-safe, and optimized for performance at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Buy/Sell Showcase Section */}
      <section
        ref={showcaseRef}
        className="py-16 sm:py-24 border-b border-border bg-card"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buy Side */}
            <div className="border border-buy bg-background/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-buy flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-buy">BUY SIDE</h4>
                  <p className="text-xs text-muted-foreground">
                    LONG POSITIONS
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Active Orders
                  </span>
                  <span className="text-sm font-bold text-buy">1,247</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Total Volume
                  </span>
                  <span className="text-sm font-bold text-buy">$8.2M</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Avg Spread
                  </span>
                  <span className="text-sm font-bold text-buy">0.12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Best Bid
                  </span>
                  <span className="text-sm font-bold text-buy">$0.6543</span>
                </div>
              </div>
            </div>

            {/* Sell Side */}
            <div className="border border-sell bg-background/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-sell flex items-center justify-center">
                  <Activity className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-sell">SELL SIDE</h4>
                  <p className="text-xs text-muted-foreground">
                    SHORT POSITIONS
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Active Orders
                  </span>
                  <span className="text-sm font-bold text-sell">983</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Total Volume
                  </span>
                  <span className="text-sm font-bold text-sell">$4.7M</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Avg Spread
                  </span>
                  <span className="text-sm font-bold text-sell">0.15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Best Ask
                  </span>
                  <span className="text-sm font-bold text-sell">$0.6551</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs Section */}
      <section ref={techRef} className="py-16 sm:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 mb-4 border border-border text-muted-foreground text-xs">
                TECHNICAL ARCHITECTURE
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
                ENTERPRISE-GRADE
                <br />
                <span className="text-success">INFRASTRUCTURE</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-success mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground mb-1">
                      Polymarket WebSocket API
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Real-time market data streaming with automatic
                      reconnection and error recovery
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-buy mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground mb-1">
                      CLOB Client SDK
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Official Polymarket client for order management and trade
                      execution
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-sell mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground mb-1">
                      Zustand State Management
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Efficient global state with minimal re-renders and optimal
                      performance
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-success mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground mb-1">
                      Next.js 15 + React Server Components
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fast page loads, optimal SEO, and server-side rendering
                      where needed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border bg-card p-6">
              <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                SYSTEM STATUS
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">
                    WebSocket Status
                  </span>
                  <span className="text-success">● CONNECTED</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">CLOB API</span>
                  <span className="text-success">● ONLINE</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Active Markets</span>
                  <span className="text-foreground font-bold">2,847</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">
                    24h Trading Volume
                  </span>
                  <span className="text-buy font-bold">$12.4M</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">
                    Avg Response Time
                  </span>
                  <span className="text-success">8ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Uptime (30d)</span>
                  <span className="text-success">99.98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            START TRADING SMARTER TODAY
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join professional traders using betterPoly for real-time market
            intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group bg-buy text-background px-8 py-4 text-sm font-bold transition-all inline-flex items-center justify-center gap-2 hover:bg-buy/90 border border-buy"
            >
              LONG POSITION // ENTER DASHBOARD
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleGetStarted}
              className="group bg-sell text-background px-8 py-4 text-sm font-bold transition-all inline-flex items-center justify-center gap-2 hover:bg-sell/90 border border-sell"
            >
              SHORT POSITION // VIEW DEMO
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-8 text-xs text-muted-foreground">
            No registration required • Read-only mode available • Connect wallet
            to trade
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-muted-foreground">
              © 2024 betterPoly. Real-time data powered by Polymarket API
            </div>
            <div className="text-xs text-muted-foreground">
              Built with Next.js 15 • TypeScript • Zustand • CLOB Client
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
