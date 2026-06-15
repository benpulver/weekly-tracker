import { useState, useCallback, useEffect } from 'react';
import type { AppState, Goal, WeekData } from '../types';
import { loadState, saveState, emptyWeek } from '../store';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  const updateWeek = useCallback((weekKey: string, updater: (w: WeekData) => WeekData) => {
    setState(s => ({
      ...s,
      weeks: {
        ...s.weeks,
        [weekKey]: updater(s.weeks[weekKey] || emptyWeek(weekKey)),
      },
    }));
  }, []);

  const setGoals = useCallback((goals: Goal[]) => {
    setState(s => ({ ...s, goals }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const replaceState = useCallback((newState: AppState) => {
    setState(newState);
  }, []);

  return { state, updateWeek, setGoals, updateSettings, replaceState };
}
