"use client";

import { useEffect, useState } from "react";

export function GlitchText() {
  const [text, setText] = useState("GLITCH EFFECT");
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(5);

  const originalText = "GLITCH EFFECT";
  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  const glitchText = (input: string, intensity: number) => {
    return input
      .split("")
      .map((char) => {
        if (Math.random() < intensity / 100) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        return char;
      })
      .join("");
  };

  useEffect(() => {
    if (!isGlitching) {
      setText(originalText);
      return;
    }

    const interval = setInterval(() => {
      setText(glitchText(originalText, glitchIntensity));
    }, 50);

    return () => clearInterval(interval);
  }, [isGlitching, glitchIntensity]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <p className="text-sm font-mono font-bold text-neutral mb-1">
          GLITCH TEXT EFFECT
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          Dynamic character scrambling animation
        </p>
      </div>

      {/* Main glitch text display */}
      <div className="relative">
        <h1
          className="text-6xl font-mono font-bold tracking-wider select-none"
          style={{
            color: isGlitching ? "#84cc16" : "#a3a3a3",
            textShadow: isGlitching
              ? "0 0 10px rgba(132, 204, 22, 0.5), 2px 2px 0px rgba(255, 0, 0, 0.3), -2px -2px 0px rgba(0, 255, 255, 0.3)"
              : "none",
            transition: isGlitching ? "none" : "all 0.3s ease",
          }}
        >
          {text}
        </h1>

        {/* Additional glitch layers */}
        {isGlitching && (
          <>
            <h1
              className="absolute top-0 left-0 text-6xl font-mono font-bold tracking-wider select-none"
              style={{
                color: "rgba(255, 0, 0, 0.7)",
                transform: "translate(2px, 1px)",
                clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
              }}
            >
              {text}
            </h1>
            <h1
              className="absolute top-0 left-0 text-6xl font-mono font-bold tracking-wider select-none"
              style={{
                color: "rgba(0, 255, 255, 0.7)",
                transform: "translate(-2px, -1px)",
                clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
              }}
            >
              {text}
            </h1>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setIsGlitching(!isGlitching)}
          className={`px-6 py-3 text-sm font-mono font-bold transition-all ${
            isGlitching
              ? "bg-primary text-primary-foreground animate-pulse"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {isGlitching ? "⚡ GLITCHING..." : "START GLITCH"}
        </button>

        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              Intensity:
            </span>
            <span className="text-xs font-mono text-neutral font-bold">
              {glitchIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={glitchIntensity}
            onChange={(e) => setGlitchIntensity(Number(e.target.value))}
            className="w-full h-2 bg-muted appearance-none cursor-pointer"
            style={{
              accentColor: "#84cc16",
            }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setGlitchIntensity(5)}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            LOW
          </button>
          <button
            onClick={() => setGlitchIntensity(15)}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            MED
          </button>
          <button
            onClick={() => setGlitchIntensity(30)}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            HIGH
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-xs font-mono text-muted-foreground max-w-md">
        <p>
          This effect simulates digital glitches by randomly replacing characters
          and adding RGB channel splitting for a cyberpunk aesthetic.
        </p>
      </div>
    </div>
  );
}
