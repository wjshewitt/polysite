"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Terminal as TerminalIcon,
  Zap,
  Shield,
  Cpu,
  Globe,
  Clock,
  ChevronRight,
  Crosshair,
  Maximize2,
  Circle,
  Binary,
  Search,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dithering from "@/components/Dithering";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Simulated Data & Hooks ---
const useMarketGenerator = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const generatePrice = (base: number) => {
      const variance = Math.random() * 0.1 - 0.05;
      let price = base + variance;
      price = Math.max(0.01, Math.min(0.99, price));
      return {
        val: price.toFixed(3),
        dir: variance > 0 ? 1 : -1,
        change: (variance * 100).toFixed(2),
      };
    };

    return [
      {
        id: "TRUMP.24",
        name: "TRUMP 2024 VICTORY",
        volume: "942.5M",
        ...generatePrice(0.52),
      },
      {
        id: "FED.NOV",
        name: "FED RATES UNCHANGED",
        volume: "112.8M",
        ...generatePrice(0.91),
      },
      {
        id: "BTC.100K",
        name: "BTC > $100K EOY",
        volume: "345.2M",
        ...generatePrice(0.34),
      },
      {
        id: "ETH.ETF",
        name: "ETH ETF APPROVAL",
        volume: "889.1M",
        ...generatePrice(0.12),
      },
      {
        id: "TSLA.EARN",
        name: "TSLA Q3 BEAT",
        volume: "45.4M",
        ...generatePrice(0.67),
      },
      {
        id: "X.BANKRUPT",
        name: "X BANKRUPTCY 2024",
        volume: "18.9M",
        ...generatePrice(0.28),
      },
      {
        id: "US.RECESS",
        name: "US RECESSION CONFIRMED",
        volume: "224.1M",
        ...generatePrice(0.45),
      },
      {
        id: "NVDA.1K",
        name: "NVDA > $1000",
        volume: "67.2M",
        ...generatePrice(0.82),
      },
    ];
  }, [tick]);
};

// --- Avant-Garde Components ---

const NoiseLayer = () => (
  <div className="pointer-events-none fixed inset-0 z-[99] mix-blend-overlay opacity-[0.15]">
    <svg
      viewBox="0 0 250 250"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="3.5"
          numOctaves="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const GridOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-[98] bg-[size:40px_40px] bg-[linear-gradient(to_right,#FFFFFF03_1px,transparent_1px),linear-gradient(to_bottom,#FFFFFF03_1px,transparent_1px)]" />
);

const CornerMarks = () => (
  <>
    <div className="fixed top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white/30 z-50" />
    <div className="fixed top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white/30 z-50" />
    <div className="fixed bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white/30 z-50" />
    <div className="fixed bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white/30 z-50" />
  </>
);

const Marquee = ({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) => (
  <div className="flex overflow-hidden select-none bg-[#00FF9C] text-black py-1 font-mono text-xs font-bold tracking-widest border-y border-black">
    <div
      className={cn(
        "flex min-w-full shrink-0 items-center gap-8 animate-marquee",
        reverse && "animate-marquee-reverse",
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8">
          {item} <Crosshair className="w-3 h-3" />
        </span>
      ))}
    </div>
    <div
      aria-hidden="true"
      className={cn(
        "flex min-w-full shrink-0 items-center gap-8 animate-marquee",
        reverse && "animate-marquee-reverse",
      )}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-8">
          {item} <Crosshair className="w-3 h-3" />
        </span>
      ))}
    </div>
  </div>
);

// --- Main Application ---

export default function HomeTest() {
  const markets = useMarketGenerator();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-black text-white overflow-x-hidden flex flex-col relative">
        {/* STYLE INJECTION for animations */}
        <style jsx global>{`
          @keyframes marquee {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-100%);
            }
          }
          @keyframes marquee-reverse {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee-reverse {
            animation: marquee-reverse 20s linear infinite;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #111;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>

        {/* LAYERS */}
        <NoiseLayer />
        <GridOverlay />
        <CornerMarks />

        {/* --- HERO SECTION WITH DITHERING --- */}
        <section className="relative overflow-hidden border-b border-[#333]">
          {/* Dithering Background Layer */}
          <div className="absolute inset-0 opacity-70">
            <Dithering />
          </div>

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>

          {/* Hero Content */}
          <div className="relative z-10 px-4 py-28 sm:py-30">
            <div className="max-w-6xl mx-auto">
              <div className="inline-block px-3 py-1 mb-6 border border-[#00FF9C] text-[#00FF9C] text-xs bg-black/50 backdrop-blur-sm font-mono font-bold tracking-widest">
                TERMINAL INTERFACE // LIVE STREAMING
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-white leading-none">
                PREDICTION MARKET
                <br />
                <span className="text-[#00FF9C]">TERMINAL</span>
              </h1>

              <p className="text-lg sm:text-xl text-neutral-300 mb-8 max-w-3xl font-mono leading-relaxed">
                Real-time WebSocket feeds // Order book depth analysis // Market
                monitoring console
                <br />
                Professional-grade terminal interface for serious traders
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="group bg-[#00FF9C] text-black px-6 py-3 text-sm font-black tracking-widest transition-all flex items-center gap-2 hover:bg-white border border-[#00FF9C]"
                >
                  ENTER TERMINAL
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border border-[#333] bg-black/50 backdrop-blur-sm text-white px-6 py-3 text-sm font-black tracking-widest transition-all hover:bg-[#111] hover:border-white">
                  VIEW API DOCS
                </button>
              </div>

              {/* Reduced Stats Bar - only 2 boxes */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <div className="border border-[#333] bg-black/50 backdrop-blur-sm p-6 flex-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#00FF9C] mb-1">
                    &lt;10ms
                  </div>
                  <div className="text-xs text-neutral-500 font-mono tracking-widest">
                    AVG_LATENCY
                  </div>
                </div>
                <div className="border border-[#333] bg-black/50 backdrop-blur-sm p-6 flex-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#55AFFF] mb-1">
                    99.9%
                  </div>
                  <div className="text-xs text-neutral-500 font-mono tracking-widest">
                    UPTIME_SLA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HEADER --- */}
        <header className="sticky top-0 z-[100] bg-black border-b border-[#333]">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-black tracking-tighter">
                better<span className="text-[#00FF9C]">Poly</span>
              </h1>
              <nav className="hidden md:flex gap-4 font-mono text-xs font-bold tracking-wider">
                <a
                  href="/dashboard"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  DASHBOARD
                </a>
                <a href="/hometest" className="text-white">
                  HOMETEST
                </a>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  API
                </a>
                <a
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  DOCS
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
                <Clock className="w-4 h-4 text-[#55AFFF]" />
                <span className="text-neutral-400">
                  {time.toISOString().split("T")[1].slice(0, 8)} UTC
                </span>
              </div>
              <button className="px-4 py-2 bg-[#00FF9C] text-black hover:bg-white font-bold text-sm tracking-wider transition-colors">
                CONNECT
              </button>
            </div>
          </div>

          <Marquee
            items={[
              "MARKET_STATUS: OPERATIONAL",
              "LIQUIDITY: $1.2B",
              "AVG_LATENCY: 45MS",
              "ACTIVE_TRADERS: 12,340",
              "24H_VOLUME: $89.2M",
              "UPTIME: 99.99%",
            ]}
          />
        </header>

        {/* --- MAIN --- */}
        <main className="flex-grow px-4 py-8">
          {/* HERO STATS */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1A1A1A] border border-[#333] p-6 relative overflow-hidden group hover:border-[#00FF9C] transition-colors">
              <Activity className="absolute top-4 right-4 w-6 h-6 text-neutral-700 group-hover:text-[#00FF9C] transition-colors" />
              <h3 className="font-mono text-xs text-neutral-500 font-bold tracking-widest mb-2">
                TOTAL_VOLUME
              </h3>
              <p className="text-4xl font-black tracking-tighter">$1.2B</p>
              <div className="flex items-center gap-1 mt-2 text-[#00FF9C] text-sm font-mono">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.4%</span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333] p-6 relative overflow-hidden group hover:border-[#55AFFF] transition-colors">
              <Zap className="absolute top-4 right-4 w-6 h-6 text-neutral-700 group-hover:text-[#55AFFF] transition-colors" />
              <h3 className="font-mono text-xs text-neutral-500 font-bold tracking-widest mb-2">
                LIVE_MARKETS
              </h3>
              <p className="text-4xl font-black tracking-tighter">2,847</p>
              <div className="flex items-center gap-1 mt-2 text-[#55AFFF] text-sm font-mono">
                <ArrowUpRight className="w-4 h-4" />
                <span>+340</span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333] p-6 relative overflow-hidden group hover:border-white transition-colors">
              <Shield className="absolute top-4 right-4 w-6 h-6 text-neutral-700 group-hover:text-white transition-colors" />
              <h3 className="font-mono text-xs text-neutral-500 font-bold tracking-widest mb-2">
                TOTAL_TRADERS
              </h3>
              <p className="text-4xl font-black tracking-tighter">12.3K</p>
              <div className="flex items-center gap-1 mt-2 text-white text-sm font-mono">
                <ArrowUpRight className="w-4 h-4" />
                <span>+890</span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333] p-6 relative overflow-hidden group hover:border-[#FF3C3C] transition-colors">
              <TerminalIcon className="absolute top-4 right-4 w-6 h-6 text-neutral-700 group-hover:text-[#FF3C3C] transition-colors" />
              <h3 className="font-mono text-xs text-neutral-500 font-bold tracking-widest mb-2">
                API_CALLS/SEC
              </h3>
              <p className="text-4xl font-black tracking-tighter">45.2K</p>
              <div className="flex items-center gap-1 mt-2 text-[#FF3C3C] text-sm font-mono">
                <ArrowDownRight className="w-4 h-4" />
                <span>-2.1%</span>
              </div>
            </div>
          </section>

          {/* MAIN GRID - LEFT SIDEBAR + CONSOLE + RIGHT RAIL */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT SIDEBAR - LIVE MARKETS */}
            <div className="col-span-1 lg:col-span-2 bg-black border border-[#333] flex flex-col max-h-[600px]">
              <div className="bg-[#111] px-4 py-2 border-b border-[#333] flex items-center justify-between">
                <h2 className="font-mono text-xs font-bold tracking-widest">
                  LIVE_FEED
                </h2>
                <Binary className="w-4 h-4 text-[#00FF9C]" />
              </div>
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {markets.map((m, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-3 border-b border-[#222] hover:bg-[#111] cursor-pointer transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#00FF9C] transition-colors">
                        {m.id}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-sm font-bold",
                          m.dir > 0 ? "text-[#00FF9C]" : "text-[#FF3C3C]",
                        )}
                      >
                        {m.val}¢
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                      <span>{m.volume}</span>
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          m.dir > 0 ? "text-[#00FF9C]" : "text-[#FF3C3C]",
                        )}
                      >
                        {m.dir > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {m.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN CONSOLE */}
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-4">
              {/* Top Search/Filter Bar */}
              <div className="bg-black border border-[#333] p-2 flex gap-2">
                <div className="flex-grow relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="SEARCH MARKETS OR COMMANDS..."
                    className="w-full bg-[#111] border border-[#222] py-2 pl-10 pr-4 font-mono text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-[#55AFFF]"
                  />
                </div>
                <button className="px-4 bg-[#111] border border-[#222] text-neutral-400 hover:text-white font-mono text-xs">
                  FILTER
                </button>
                <button className="px-4 bg-[#111] border border-[#222] text-neutral-400 hover:text-white font-mono text-xs">
                  EXPORT
                </button>
              </div>

              {/* The 'Terminal' Output */}
              <div className="flex-grow bg-black border border-[#333] flex flex-col min-h-[400px]">
                <div className="bg-[#111] px-4 py-2 border-b border-[#333] flex justify-between items-center">
                  <div className="flex gap-4 font-mono text-xs">
                    <span className="text-[#00FF9C]">user@betterpoly:~</span>
                    <span className="text-neutral-500">/api/v3/stream</span>
                  </div>
                  <div className="flex gap-2">
                    <Circle className="w-3 h-3 text-[#FF3C3C] fill-[#FF3C3C]" />
                    <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Circle className="w-3 h-3 text-[#00FF9C] fill-[#00FF9C]" />
                  </div>
                </div>
                <div className="p-6 font-mono text-sm text-[#00FF9C] overflow-hidden relative flex-grow">
                  <div className="absolute inset-0 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    <div className="opacity-50">
                      Connecting to wss://stream.betterpoly.com... OK
                    </div>
                    <div className="opacity-50">
                      Authenticating API Key... OK
                    </div>
                    <div className="text-white mt-4">
                      &gt; SUBSCRIBE MARKET:ALL_POLITICS
                    </div>
                    <div className="text-[#55AFFF]">
                      [STREAM_START] 12 channels connected
                    </div>
                    {markets.slice(0, 4).map((m, i) => (
                      <div
                        key={i}
                        className="flex gap-4 text-xs whitespace-nowrap"
                      >
                        <span className="text-neutral-500">
                          {new Date().toISOString().split("T")[1]}
                        </span>
                        <span className="text-yellow-200">TRADE</span>
                        <span className="text-white">{m.id}</span>
                        <span
                          className={
                            m.dir > 0 ? "text-[#00FF9C]" : "text-[#FF3C3C]"
                          }
                        >
                          {m.val}
                        </span>
                        <span className="text-neutral-400">
                          SZ: {(Math.random() * 10000).toFixed(0)}
                        </span>
                      </div>
                    ))}
                    <div className="animate-pulse mt-2">_</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT RAIL - STATS */}
            <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
              <div className="bg-[#00FF9C] p-6 text-black flex flex-col justify-between min-h-[180px] relative overflow-hidden group hover:invert transition-all">
                <Cpu className="w-8 h-8 mb-auto" />
                <div>
                  <h3 className="font-black text-4xl tracking-tighter">
                    99.99%
                  </h3>
                  <p className="font-mono text-xs font-bold tracking-widest">
                    UPTIME_SLA
                  </p>
                </div>
                <Maximize2 className="absolute top-4 right-4 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="bg-black border border-[#333] p-6 text-white flex flex-col justify-between min-h-[180px]">
                <Globe className="w-8 h-8 mb-auto text-[#55AFFF]" />
                <div>
                  <h3 className="font-black text-4xl tracking-tighter flex gap-2 items-baseline">
                    150
                    <span className="text-lg font-medium text-neutral-500">
                      ms
                    </span>
                  </h3>
                  <p className="font-mono text-xs font-bold tracking-widest text-neutral-400">
                    GLOBAL_LATENCY
                  </p>
                </div>
              </div>

              <div className="flex-grow bg-[#1A1A1A] border border-[#333] p-6 flex items-center justify-center text-center">
                <div>
                  <p className="font-mono text-xs text-neutral-500 mb-4">
                    READY TO UPGRADE?
                  </p>
                  <button className="bg-white text-black hover:bg-[#55AFFF] px-6 py-3 font-bold text-sm tracking-wider transition-colors">
                    GET INSTITUTIONAL ACCESS
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* --- FOOTER --- */}
        <footer className="bg-black border-t border-[#333] pt-16 pb-2 px-4 flex justify-between items-center font-mono text-[10px] text-neutral-600">
          <div>© 2024 betterPoly. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-4">
            <span>TERMS_V1.2</span>
            <span>PRIVACY_PROTOCOL</span>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
