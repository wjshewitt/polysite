"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(1234);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev < target) {
          const increment = Math.ceil((target - prev) / 10);
          return Math.min(prev + increment, target);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [target]);

  useEffect(() => {
    const targetInterval = setInterval(() => {
      setTarget(Math.floor(Math.random() * 9999) + 1000);
      setCount(0);
    }, 5000);

    return () => clearInterval(targetInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      <div className="text-6xl font-mono font-bold text-primary">
        {count.toLocaleString()}
      </div>
      <div className="text-sm font-mono text-muted-foreground">
        Target: {target.toLocaleString()}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setTarget(Math.floor(Math.random() * 9999) + 1000);
            setCount(0);
          }}
          className="px-4 py-2 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          RANDOMIZE
        </button>
      </div>
    </div>
  );
}
