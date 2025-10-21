"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

export function FlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
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

    // Initialize particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0,
      life: Math.random() * 100,
      maxLife: 100,
      hue: Math.random() * 60 + 60, // Green-ish hues
    }));

    // Flow field function
    const getFlowAngle = (x: number, y: number, time: number) => {
      const scale = 0.005;
      const timeScale = 0.001;
      return (
        Math.sin(x * scale + time * timeScale) * Math.PI +
        Math.cos(y * scale + time * timeScale) * Math.PI
      );
    };

    // Animation loop
    const animate = () => {
      timeRef.current += 1;
      const time = timeRef.current;

      // Fade effect instead of clear
      ctx.fillStyle = "rgba(9, 9, 11, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update particle based on flow field
        const angle = getFlowAngle(particle.x, particle.y, time);
        const force = 0.5;
        particle.vx += Math.cos(angle) * force;
        particle.vy += Math.sin(angle) * force;

        // Apply velocity with damping
        const damping = 0.95;
        particle.vx *= damping;
        particle.vy *= damping;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update life
        particle.life -= 1;

        // Wrap around edges or respawn
        if (
          particle.x < 0 ||
          particle.x > canvas.width ||
          particle.y < 0 ||
          particle.y > canvas.height ||
          particle.life <= 0
        ) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.vx = 0;
          particle.vy = 0;
          particle.life = particle.maxLife;
          particle.hue = Math.random() * 60 + 60;
        }

        // Draw particle
        const alpha = particle.life / particle.maxLife;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const size = Math.min(3, speed * 0.5 + 1);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 50%, ${alpha * 0.8})`;
        ctx.fill();

        // Draw trail
        if (speed > 0.5) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
          ctx.strokeStyle = `hsla(${particle.hue}, 70%, 50%, ${alpha * 0.3})`;
          ctx.lineWidth = size * 0.5;
          ctx.stroke();
        }
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
        style={{ minHeight: "400px" }}
      />
      <div className="absolute top-4 left-4 text-left pointer-events-none">
        <p className="text-xl font-mono font-bold text-primary">
          FLOW FIELD
        </p>
        <p className="text-xs font-mono text-muted-foreground mt-1">
          Perlin-inspired particle flow simulation
        </p>
      </div>
      <div className="absolute bottom-4 left-4 text-left pointer-events-none">
        <p className="text-xs font-mono text-muted-foreground">
          {particlesRef.current.length} particles
        </p>
      </div>
    </div>
  );
}
