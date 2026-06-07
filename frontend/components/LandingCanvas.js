"use client";

import { useEffect, useRef } from "react";

export default function LandingCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrame;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let dpr = 1;

    const rings = [
      { frac: 0.18, speed: 0.00018, gap: 0.0, angle: Math.random() * Math.PI * 2 },
      { frac: 0.32, speed: -0.00022, gap: 0.55, angle: Math.random() * Math.PI * 2 },
      { frac: 0.46, speed: 0.00015, gap: 0.9, angle: Math.random() * Math.PI * 2 },
      { frac: 0.6, speed: -0.00012, gap: 0.6, angle: Math.random() * Math.PI * 2 },
      { frac: 0.76, speed: 0.0001, gap: 1.1, angle: Math.random() * Math.PI * 2 },
      { frac: 0.92, speed: -0.00008, gap: 0.8, angle: Math.random() * Math.PI * 2 }
    ];

    const lines = [
      { angle: 0.38, speed: 0.000055, alpha: 0.06 },
      { angle: -0.52, speed: -0.00004, alpha: 0.05 }
    ];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      centerX = width * 0.5;
      centerY = height * 0.5;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 1.05;

      rings.forEach((ring) => {
        ring.angle += ring.speed;
        const radius = ring.frac * maxRadius;
        const fade = 1 - (ring.frac - 0.18) / 1.1;

        ctx.beginPath();
        if (ring.gap > 0) {
          ctx.arc(
            centerX,
            centerY,
            radius,
            ring.angle + ring.gap * 0.5,
            ring.angle + Math.PI * 2 - ring.gap * 0.5
          );
        } else {
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        }
        ctx.strokeStyle = `rgba(200,134,10,${0.1 * fade + 0.02})`;
        ctx.lineWidth = 0.7 + fade * 0.5;
        ctx.stroke();
      });

      lines.forEach((line) => {
        line.angle += line.speed;
        const length = Math.max(width, height) * 1.6;
        const cos = Math.cos(line.angle);
        const sin = Math.sin(line.angle);

        ctx.beginPath();
        ctx.moveTo(centerX - cos * length, centerY - sin * length);
        ctx.lineTo(centerX + cos * length, centerY + sin * length);
        ctx.strokeStyle = `rgba(200,134,10,${line.alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.35);
      glow.addColorStop(0, "rgba(200,134,10,0.04)");
      glow.addColorStop(0.5, "rgba(200,134,10,0.015)");
      glow.addColorStop(1, "rgba(200,134,10,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70" />;
}
