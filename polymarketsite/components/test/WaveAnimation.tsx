"use client";

import { useEffect, useRef } from "react";

export function WaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      timeRef.current += 0.02;
      const time = timeRef.current;

      // Clear canvas
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waves = [
        { amplitude: 30, frequency: 0.02, phase: 0, color: "rgba(132, 204, 22, 0.3)", offset: 0 },
        { amplitude: 40, frequency: 0.015, phase: Math.PI / 4, color: "rgba(132, 204, 22, 0.2)", offset: 20 },
        { amplitude: 25, frequency: 0.025, phase: Math.PI / 2, color: "rgba(132, 204, 22, 0.4)", offset: -10 },
      ];

      // Draw waves
      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            wave.offset +
            Math.sin(x * wave.frequency + time + wave.phase) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();

        // Draw wave line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            wave.offset +
            Math.sin(x * wave.frequency + time + wave.phase) * wave.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave.color.replace("0.3", "0.8").replace("0.2", "0.8").replace("0.4", "0.8");
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-background"
        style={{ minHeight: "300px" }}
      />
      <div className="absolute top-4 left-4 text-left pointer-events-none">
        <p className="text-xl font-mono font-bold text-primary">
          WAVE OSCILLATOR
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Layered sine wave animation
        </p>
      </div>
    </div>
  );
}
