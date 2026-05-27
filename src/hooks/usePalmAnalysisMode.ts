import { useEffect, useState, useCallback } from 'react';

export type PalmAnalysisMode = 'cv-grounded' | 'ai-only';

const STORAGE_KEY = 'bhaktverse:palm-analysis-mode';

const read = (): PalmAnalysisMode => {
  if (typeof window === 'undefined') return 'cv-grounded';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'ai-only' ? 'ai-only' : 'cv-grounded';
};

export function usePalmAnalysisMode() {
  const [mode, setModeState] = useState<PalmAnalysisMode>(read);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setModeState(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setMode = useCallback((m: PalmAnalysisMode) => {
    window.localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  }, []);

  return { mode, setMode, isCvGrounded: mode === 'cv-grounded' };
}
