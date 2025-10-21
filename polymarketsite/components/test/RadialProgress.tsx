"use client";

import { useEffect, useState } from "react";

export function RadialProgress() {
  const [progress, setProgress] = useState(0);
  const [target, setTarget] = useState(75);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < target) {
          return Math.min(prev + 2, target);
        } else if (prev > target) {
          return Math.max(prev - 2, target);
        }
        return prev;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [target, isAnimating]);

  useEffect(() => {
    if (!isAnimating) return;

    const targetInterval = setInterval(() => {
      setTarget(Math.floor(Math.random() * 100));
    }, 4000);

    return () => clearInterval(targetInterval);
  }, [isAnimating]);

  const radius = 100;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = (value: number) => {
    if (value < 33) return "#ef4444"; // red
    if (value < 66) return "#f59e0b"; // orange
    return "#84cc16"; // green
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <p className="text-sm font-mono font-bold text-neutral">
          RADIAL PROGRESS
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Circular progress indicator with dynamic colors
        </p>
      </div>

      {/* Main radial progress */}
      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          {/* Background circle */}
          <circle
            stroke="#27272a"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor(progress)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: `drop-shadow(0 0 8px ${getColor(progress)}40)`,
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-mono font-bold" style={{ color: getColor(progress) }}>
            {Math.round(progress)}%
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Target: {target}%
          </div>
        </div>
      </div>

      {/* Multiple small radials */}
      <div className="flex gap-6">
        {[25, 50, 75, 100].map((value) => {
          const smallRadius = 40;
          const smallStroke = 6;
          const smallNormalizedRadius = smallRadius - smallStroke / 2;
          const smallCircumference = smallNormalizedRadius * 2 * Math.PI;
          const smallStrokeDashoffset =
            smallCircumference - (value / 100) * smallCircumference;

          return (
            <div key={value} className="relative">
              <svg height={smallRadius * 2} width={smallRadius * 2}>
                <circle
                  stroke="#27272a"
                  fill="transparent"
                  strokeWidth={smallStroke}
                  r={smallNormalizedRadius}
                  cx={smallRadius}
                  cy={smallRadius}
                />
                <circle
                  stroke={getColor(value)}
                  fill="transparent"
                  strokeWidth={smallStroke}
                  strokeDasharray={smallCircumference + " " + smallCircumference}
                  style={{
                    strokeDashoffset: smallStrokeDashoffset,
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                  }}
                  strokeLinecap="round"
                  r={smallNormalizedRadius}
                  cx={smallRadius}
                  cy={smallRadius}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-neutral">
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-4 py-2 text-xs font-mono transition-colors ${
            isAnimating
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isAnimating ? "PAUSE" : "RESUME"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setTarget(25);
              setIsAnimating(true);
            }}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            25%
          </button>
          <button
            onClick={() => {
              setTarget(50);
              setIsAnimating(true);
            }}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            50%
          </button>
          <button
            onClick={() => {
              setTarget(75);
              setIsAnimating(true);
            }}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            75%
          </button>
          <button
            onClick={() => {
              setTarget(100);
              setIsAnimating(true);
            }}
            className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            100%
          </button>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value));
            setIsAnimating(true);
          }}
          className="w-64 h-2 bg-muted appearance-none cursor-pointer"
          style={{
            accentColor: getColor(progress),
          }}
        />
      </div>
    </div>
  );
}
