"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  phrases: string[];
  className?: string;
  speedMin?: number;
  speedMax?: number;
  density?: number;
};

export default function BouncingWords({
  phrases,
  className = "font-[family-name:var(--font-nav)] uppercase tracking-[3px] text-xs sm:text-sm text-black/25",
  speedMin = 60,
  speedMax = 120,
  density,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLSpanElement[]>([]);
  const animRef = useRef<number>();
  const lastTsRef = useRef<number>(0);
  const boundsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const itemsRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; w: number; h: number }>
  >([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const texts = density && density > 0 ? phrases.slice(0, density) : phrases;

    const rect = container.getBoundingClientRect();
    boundsRef.current = { w: rect.width, h: rect.height };

    itemsRef.current = texts.map((_, i) => {
      const el = itemRefs.current[i];
      const box = el.getBoundingClientRect();
      const w = box.width;
      const h = box.height;

      const speed = Math.random() * (speedMax - speedMin) + speedMin;
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const x = Math.random() * Math.max(1, boundsRef.current.w - w);
      const y = Math.random() * Math.max(1, boundsRef.current.h - h);

      return { x, y, vx, vy, w, h };
    });

    const step = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;

      const { w: bw, h: bh } = boundsRef.current;

      itemsRef.current.forEach((it, i) => {
        let x = it.x + it.vx * dt;
        let y = it.y + it.vy * dt;

        if (x <= 0) {
          x = 0;
          it.vx = Math.abs(it.vx);
        } else if (x + it.w >= bw) {
          x = bw - it.w;
          it.vx = -Math.abs(it.vx);
        }

        if (y <= 0) {
          y = 0;
          it.vy = Math.abs(it.vy);
        } else if (y + it.h >= bh) {
          y = bh - it.h;
          it.vy = -Math.abs(it.vy);
        }

        it.x = x;
        it.y = y;
        const el = itemRefs.current[i];
        if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);

    const onResize = () => {
      const r = container.getBoundingClientRect();
      boundsRef.current = { w: r.width, h: r.height };
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [phrases, density, speedMin, speedMax]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {(density && density > 0 ? phrases.slice(0, density) : phrases).map((text, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) itemRefs.current[i] = el;
          }}
          className={`absolute will-change-transform ${className}`}
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}