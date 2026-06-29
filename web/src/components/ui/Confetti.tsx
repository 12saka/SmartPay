"use client";

import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

// Lightweight CSS-particle confetti — no external deps
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#22C55E', '#0B1329'];
const PARTICLE_COUNT = 80;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function Confetti({ active, duration = 3000, onComplete }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    // Clear any existing particles
    container.innerHTML = '';

    // Spawn particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const particle = document.createElement('div');
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isRect = Math.random() > 0.5;
      const size = randomBetween(6, 12);

      Object.assign(particle.style, {
        position: 'absolute',
        left: `${randomBetween(5, 95)}%`,
        top: '-20px',
        width: `${size}px`,
        height: isRect ? `${size * 0.4}px` : `${size}px`,
        background: color,
        borderRadius: isRect ? '2px' : '50%',
        opacity: '1',
        animationName: 'confettiFall',
        animationDuration: `${randomBetween(1.5, 3.5)}s`,
        animationDelay: `${randomBetween(0, 1.2)}s`,
        animationTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)',
        animationFillMode: 'forwards',
        transform: `rotate(${randomBetween(0, 360)}deg)`,
        '--drift': `${randomBetween(-80, 80)}px`,
        '--spin': `${randomBetween(180, 720)}deg`,
      } as any);

      container.appendChild(particle);
    }

    // Auto cleanup after duration
    timerRef.current = setTimeout(() => {
      container.innerHTML = '';
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(timerRef.current);
      container.innerHTML = '';
    };
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden',
      }}
    />
  );
}
