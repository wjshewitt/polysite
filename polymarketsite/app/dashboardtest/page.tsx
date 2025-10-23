"use client";

import { useState } from "react";
import Design1 from "./Design1";
import Design2 from "./Design2";
import Design3 from "./Design3";
import Design4 from "./Design4";
import Design5 from "./Design5";
import Design6 from "./Design6";
import Design7 from "./Design7";
import Design8 from "./Design8";

export default function DashboardTest() {
  const [currentDesign, setCurrentDesign] = useState(1);

  const designs = [
    { id: 1, name: "Segmented Control", component: Design1 },
    { id: 2, name: "Command Bar", component: Design2 },
    { id: 3, name: "Sidebar Navigation", component: Design3 },
    { id: 4, name: "Floating Toolbar", component: Design4 },
    { id: 5, name: "Context Ribbon", component: Design5 },
    { id: 6, name: "Enhanced Current", component: Design6, highlight: true },
    { id: 7, name: "Card-Based", component: Design7 },
    { id: 8, name: "Mobile-First", component: Design8 },
  ];

  const CurrentComponent = designs.find((d) => d.id === currentDesign)?.component || Design1;

  return (
    <div className="min-h-screen bg-background">
      {/* Design Selector */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-mono text-sm text-muted-foreground">
              DASHBOARD CONTROL DESIGNS
            </h1>
            <a
              href="/dashboard"
              className="font-mono text-xs text-neutral hover:underline"
            >
              ← Back to Dashboard
            </a>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {designs.map((design) => (
              <button
                key={design.id}
                onClick={() => setCurrentDesign(design.id)}
                className={`px-4 py-2 font-mono text-xs whitespace-nowrap transition-all relative ${
                  currentDesign === design.id
                    ? "bg-neutral text-background"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {design.id}. {design.name}
                {design.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-buy rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Design Preview */}
      <div className="pt-28 pb-8">
        <CurrentComponent />
      </div>
    </div>
  );
}
