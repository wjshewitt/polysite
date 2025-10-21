"use client";

import { useState } from "react";
import { AnimatedCounter } from "@/components/test/AnimatedCounter";
import { ParticleBackground } from "@/components/test/ParticleBackground";
import { LiveChart } from "@/components/test/LiveChart";
import { WaveAnimation } from "@/components/test/WaveAnimation";
import { DataStream } from "@/components/test/DataStream";
import { InteractiveHeatmap } from "@/components/test/InteractiveHeatmap";
import { PulseIndicator } from "@/components/test/PulseIndicator";
import { GlitchText } from "@/components/test/GlitchText";
import { FlowField } from "@/components/test/FlowField";
import { RadialProgress } from "@/components/test/RadialProgress";

export default function TestPage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components = [
    { id: "counter", name: "Animated Counter", component: AnimatedCounter },
    { id: "particles", name: "Particle Background", component: ParticleBackground },
    { id: "chart", name: "Live Chart", component: LiveChart },
    { id: "wave", name: "Wave Animation", component: WaveAnimation },
    { id: "stream", name: "Data Stream", component: DataStream },
    { id: "heatmap", name: "Interactive Heatmap", component: InteractiveHeatmap },
    { id: "pulse", name: "Pulse Indicator", component: PulseIndicator },
    { id: "glitch", name: "Glitch Text", component: GlitchText },
    { id: "flow", name: "Flow Field", component: FlowField },
    { id: "radial", name: "Radial Progress", component: RadialProgress },
  ];

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-mono font-bold tracking-tight text-neutral mb-2">
            🧪 EXPERIMENTAL LAB
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            Testing ground for dynamic visuals, charts, and animations
          </p>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedComponent(selectedComponent === comp.id ? null : comp.id)}
              className={`panel p-6 text-left transition-all hover:border-primary ${
                selectedComponent === comp.id ? "border-primary bg-muted" : ""
              }`}
            >
              <h3 className="font-mono font-bold text-neutral mb-2">{comp.name}</h3>
              <p className="text-xs font-mono text-muted-foreground">
                Click to {selectedComponent === comp.id ? "hide" : "view"}
              </p>
            </button>
          ))}
        </div>

        {/* Component Display Area */}
        {selectedComponent && (
          <div className="panel p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-mono font-bold text-neutral">
                {components.find((c) => c.id === selectedComponent)?.name}
              </h2>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-xs font-mono text-muted-foreground hover:text-neutral transition-colors"
              >
                [CLOSE]
              </button>
            </div>
            <div className="min-h-[400px] flex items-center justify-center">
              {(() => {
                const Component = components.find((c) => c.id === selectedComponent)?.component;
                return Component ? <Component /> : null;
              })()}
            </div>
          </div>
        )}

        {/* All Components Demo */}
        <div className="panel p-6">
          <h2 className="text-xl font-mono font-bold text-neutral mb-6">
            FULL DEMO - ALL COMPONENTS
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {components.map((comp) => {
              const Component = comp.component;
              return (
                <div key={comp.id} className="border border-border p-4 rounded">
                  <h3 className="text-sm font-mono font-bold text-neutral mb-4">
                    {comp.name}
                  </h3>
                  <div className="h-[300px] flex items-center justify-center bg-background/50">
                    <Component />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 panel text-center">
          <p className="text-xs font-mono text-muted-foreground">
            Experimental components for testing and prototyping new features
          </p>
        </div>
      </div>
    </main>
  );
}
