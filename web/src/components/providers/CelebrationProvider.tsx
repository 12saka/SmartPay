"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Confetti } from '../ui/Confetti';

interface CelebrationContextValue {
  celebrate: (duration?: number) => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function useCelebration(): CelebrationContextValue {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error('useCelebration must be used within CelebrationProvider');
  return ctx;
}

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(3500);

  const celebrate = useCallback((dur = 3500) => {
    setDuration(dur);
    setActive(true);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      <Confetti active={active} duration={duration} onComplete={() => setActive(false)} />
      {children}
    </CelebrationContext.Provider>
  );
}
