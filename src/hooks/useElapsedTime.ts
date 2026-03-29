// src/hooks/useElapsedTime.ts
import { useState, useEffect } from 'react';
import { calculateDurationSeconds } from '@/src/utils/dateHelpers';

export function useElapsedTime(startedAt: Date | null): number {
  const [elapsed, setElapsed] = useState(
    startedAt ? calculateDurationSeconds(startedAt) : 0
  );

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    setElapsed(calculateDurationSeconds(startedAt));
    const interval = setInterval(() => {
      setElapsed(calculateDurationSeconds(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return elapsed;
}
