"use client";

import { useEffect, useState } from "react";

interface Pulse {
  id: number;
  scale: number;
  opacity: number;
}

export function PulseIndicator() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPulses((prev) => {
        // Update existing pulses
        const updated = prev
          .map((pulse) => ({
            ...pulse,
            scale: pulse.scale + 0.1 * speed,
            opacity: pulse.opacity - 0.02 * speed,
          }))
          .filter((pulse) => pulse.opacity > 0);

        // Add new pulse
        if (prev.length === 0 || prev[prev.length - 1].scale > 0.5) {
          updated.push({
            id: Date.now(),
            scale: 0,
            opacity: 1,
          });
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, speed]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <p className="text-sm font-mono font-bold text-neutral">
          PULSE INDICATOR
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Animated ripple effect for live status
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {pulses.map((pulse) => (
            <div
              key={pulse.id}
              className="absolute border-2 border-primary rounded-full"
              style={{
                width: `${100 + pulse.scale * 200}px`,
                height: `${100 + pulse.scale * 200}px`,
                opacity: pulse.opacity,
                transition: "all 0.05s linear",
              }}
            />
          ))}
        </div>

        {/* Center dot */}
        <div className="relative z-10 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <div className="w-6 h-6 bg-background rounded-full animate-pulse" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isActive ? "PAUSE" : "START"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Speed:</span>
          <button
            onClick={() => setSpeed(0.5)}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              speed === 0.5
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            SLOW
          </button>
          <button
            onClick={() => setSpeed(1)}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              speed === 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            NORMAL
          </button>
          <button
            onClick={() => setSpeed(2)}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              speed === 2
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            FAST
          </button>
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Active Pulses: {pulses.length}
        </div>
      </div>
    </div>
  );
}
