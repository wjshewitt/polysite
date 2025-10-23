import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Simulated Data & Hooks ---
const useMarketGenerator = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 800);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const generatePrice = (base: number) => {
      const variance = (Math.random() * 0.1) - 0.05;
      let price = base + variance;
      price = Math.max(0.01, Math.min(0.99, price));
      return {
        val: price.toFixed(3),
        dir: variance > 0 ? 1 : -1,
        change: (variance * 100).toFixed(2)
      };
    };

    return [
      { id: 'TRUMP.24', name: 'TRUMP 2024 VICTORY', volume: '942.5M', ...generatePrice(0.52) },
      { id: 'FED.NOV', name: 'FED RATES UNCHANGED', volume: '112.8M', ...generatePrice(0.91) },
      { id: 'BTC.100K', name: 'BTC > $100K EOY', volume: '345.2M', ...generatePrice(0.34) },
      { id: 'ETH.ETF', name: 'ETH ETF APPROVAL', volume: '889.1M', ...generatePrice(0.12) },
      { id: 'TSLA.EARN', name: 'TSLA Q3 BEAT', volume: '45.4M', ...generatePrice(0.67) },
      { id: 'X.BANKRUPT', name: 'X BANKRUPTCY 2024', volume: '18.9M', ...generatePrice(0.28) },
      { id: 'US.RECESS', name: 'US RECESSION CONFIRMED', volume: '224.1M', ...generatePrice(0.45) },
      { id: 'NVDA.1K', name: 'NVDA > $1000', volume: '67.2M', ...generatePrice(0.82) },
    ];
  }, [tick]);
};

// --- Avant-Garde Components ---

const NoiseLayer = () => (
  <div className="pointer-events-none fixed inset-0 z-[99] mix-blend-overlay opacity-[0.15]">
    <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="3.5" numOctaves="3" stitchTiles="stitch" />
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

const Marquee = ({ items, reverse = false }: { items: string[], reverse?: boolean }) => (
  <div className="flex overflow-hidden select-none bg-[#00FF9C] text-black py-1 font-mono text-xs font-bold tracking-widest border-y border-black">
    <div className={cn("flex min-w-full shrink-0 items-center gap-8 animate-marquee", reverse && "animate-marquee-reverse")}>
      {items.map((item, i) => <span key={i} className="flex items-center gap-8">{item} <Crosshair className="w-3 h-3"/></span>)}
    </div>
    <div aria-hidden="true" className={cn("flex min-w-full shrink-0 items-center gap-8 animate-marquee", reverse && "animate-marquee-reverse")}>
      {items.map((item, i) => <span key={i} className="flex items-center gap-8">{item} <Crosshair className="w-3 h-3"/></span>)}
    </div>
  </div>
);

// --- Main Application ---

export default function BetterPolyUltra() {
  const markets = useMarketGenerator();
  const [booted, setBooted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setBooted(true);
    const t = setInterval(() => {
      const d = new Date();
      setCurrentTime(`${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-[#050505] text-[#EAEAEA] selection:bg-[#00FF9C] selection:text-black overflow-x-hidden",
      !booted && "opacity-0"
    )}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
        :root {
            --font-sans: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
            --c-green: #00FF9C;
            --c-red: #FF3C3C;
            --c-blue: #55AFFF;
        }
        * { border-radius: 0px !important; cursor: crosshair; }
        body { font-family: var(--font-sans); background: #050505; }
        .font-mono { font-family: var(--font-mono); }
        
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes marquee-reverse { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 20s linear infinite; }
      `}</style>

      <NoiseLayer />
      <GridOverlay />
      <CornerMarks />

      {/* === SYSTEM STATUS BAR === */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#050505] border-b border-[#333] h-8 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#00FF9C]">
            <div className="w-2 h-2 bg-[#00FF9C] animate-pulse" />
            SYSTEM_READY
          </div>
          <div className="text-neutral-500">[ LATENCY: 14ms ]</div>
          <div className="text-neutral-500">[ NODES: 8/8 ACTIVE ]</div>
        </div>
        <div className="flex items-center gap-6">
           <span>UTC :: {currentTime}</span>
           <span className="text-[#55AFFF]">V.2.5.1-ALPHA</span>
        </div>
      </div>

      {/* === MAIN VIEWPORT === */}
      <main className="pt-8 min-h-screen flex flex-col">
        
        {/* --- HERO: THE TERMINAL HEADER --- */}
        <header className="border-b border-[#333] bg-[#0A0A0A]">
          <div className="grid grid-cols-12 min-h-[400px]">
            {/* BRAND AREA - COL 8 */}
            <div className="col-span-12 lg:col-span-8 p-6 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#333] relative overflow-hidden group">
              {/* Decorative giant background text */}
              <div className="absolute -right-20 -bottom-20 text-[20vw] leading-none font-black text-[#111] select-none pointer-events-none z-0 transition-transform group-hover:translate-x-10">
                POLY
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#333] px-2 py-1 font-mono text-xs mb-8">
                  <TerminalIcon className="w-4 h-4" /> 
                  <span>UNAUTHORIZED ACCESS PROHIBITED</span>
                </div>
                <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-6 mix-blend-difference">
                  BETTER<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF9C] via-[#55AFFF] to-white animate-pulse">POLY</span>
                </h1>
              </div>

              <div className="relative z-10 max-w-xl">
                <p className="text-lg font-medium text-neutral-400 leading-snug mb-8">
                  // The institutional standard for prediction market intelligence. Zero-latency feeds, algorithmic execution, and deep liquidity analysis.
                </p>
                <div className="flex gap-4">
                  <button className="bg-[#EAEAEA] text-black px-8 py-4 font-mono font-bold text-sm hover:bg-[#00FF9C] transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4" /> INITIATE_TERMINAL
                  </button>
                  <button className="border border-[#333] text-[#EAEAEA] px-8 py-4 font-mono font-bold text-sm hover:border-[#EAEAEA] transition-colors flex items-center gap-2">
                     VIEW_DOCS <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE READOUT - COL 4 */}
            <div className="col-span-12 lg:col-span-4 bg-black flex flex-col">
              <div className="p-3 border-b border-[#333] flex justify-between items-center">
                <span className="font-mono text-xs text-[#55AFFF]">LIVE_TICKER // TOP_VOLUME</span>
                <Activity className="w-4 h-4 text-[#55AFFF]" />
              </div>
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {markets.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-4 border-b border-[#222] font-mono text-sm hover:bg-[#111] group transition-all">
                    <div>
                      <div className="font-bold text-[#EAEAEA] mb-1 group-hover:text-[#00FF9C]">{m.id}</div>
                      <div className="text-[10px] text-neutral-500">VOL: {m.volume}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-base font-bold",
                        m.dir > 0 ? "text-[#00FF9C]" : "text-[#FF3C3C]"
                      )}>
                        {m.val}
                      </div>
                      <div className="text-[10px] flex items-center justify-end gap-1">
                         {m.dir > 0 ? '+' : ''}{m.change}%
                         {m.dir > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <Marquee items={[
          "BTC HITS NEW ATH ON POLYMARKET",
          "WHALE ALERT: $4.5M BUY ORDER ON 'FED.NOV'",
          "API LATENCY SPKE DETECTED IN EU-WEST-1",
          "NEW MARKET LISTED: 'SUPERBOWL.LVII'",
          "SYSTEM MAINTAINANCE SCHEDULED 04:00 UTC"
        ]} />

        {/* --- WORKSPACE GRID --- */}
        <section className="flex-grow bg-[#111] p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          
          {/* LEFT RAIL - NAV */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-px bg-[#333] border border-[#333]">
            {[ 
              { icon: Globe, label: 'MARKET_SCAN' },
              { icon: Binary, label: 'ALGO_TRADER' },
              { icon: Shield, label: 'RISK_OPS' },
              { icon: TerminalIcon, label: 'API_CONSOLE', active: true },
              { icon: Clock, label: 'HISTORY' },
            ].map((item) => (
              <button 
                key={item.label} 
                className={cn(
                  "p-4 flex items-center gap-3 font-mono text-xs font-bold transition-all text-left hover:pl-6",
                  item.active ? "bg-[#00FF9C] text-black" : "bg-black text-neutral-400 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="flex-grow bg-black" />
            <div className="bg-black p-4 font-mono text-[10px] text-neutral-600">
              SESSION ID:<br/>0x7F9A2B3C
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
                  <div className="opacity-50">Connecting to wss://stream.betterpoly.com... OK</div>
                  <div className="opacity-50">Authenticating API Key... OK</div>
                  <div className="text-white mt-4">&gt; SUBSCRIBE MARKET:ALL_POLITICS</div>
                  <div className="text-[#55AFFF]">[STREAM_START] 12 channels connected</div>
                  {markets.slice(0, 4).map((m, i) => (
                    <div key={i} className="flex gap-4 text-xs whitespace-nowrap">
                      <span className="text-neutral-500">{new Date().toISOString().split('T')[1]}</span>
                      <span className="text-yellow-200">TRADE</span>
                      <span className="text-white">{m.id}</span>
                      <span className={m.dir > 0 ? 'text-[#00FF9C]' : 'text-[#FF3C3C]'}>{m.val}</span>
                      <span className="text-neutral-400">SZ: {(Math.random()*10000).toFixed(0)}</span>
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
                    <h3 className="font-black text-4xl tracking-tighter">99.99%</h3>
                    <p className="font-mono text-xs font-bold tracking-widest">UPTIME_SLA</p>
                </div>
                <Maximize2 className="absolute top-4 right-4 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>

             <div className="bg-black border border-[#333] p-6 text-white flex flex-col justify-between min-h-[180px]">
                <Globe className="w-8 h-8 mb-auto text-[#55AFFF]" />
                <div>
                    <h3 className="font-black text-4xl tracking-tighter flex gap-2 items-baseline">
                        150<span className="text-lg font-medium text-neutral-500">ms</span>
                    </h3>
                    <p className="font-mono text-xs font-bold tracking-widest text-neutral-400">GLOBAL_LATENCY</p>
                </div>
             </div>

             <div className="flex-grow bg-[#1A1A1A] border border-[#333] p-6 flex items-center justify-center text-center">
                 <div>
                     <p className="font-mono text-xs text-neutral-500 mb-4">READY TO UPGRADE?</p>
                     <button className="bg-white text-black hover:bg-[#55AFFF] px-6 py-3 font-bold text-sm tracking-wider transition-colors">
                         GET INSTITUTIONAL ACCESS
                     </button>
                 </div>
             </div>
          </div>

        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-black border-t border-[#333] py-2 px-4 flex justify-between items-center font-mono text-[10px] text-neutral-600">
         <div>© 2024 AND-NOW DESIGN SYSTEMS. ALL RIGHTS RESERVED.</div>
         <div className="flex gap-4">
            <span>TERMS_V1.2</span>
            <span>PRIVACY_PROTOCOL</span>
         </div>
      </footer>
    </div>
  );
}
