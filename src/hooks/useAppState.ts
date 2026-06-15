import { useState, useCallback } from 'react';
import type { AppState, Goal, WeekData } from '../types';
import { loadState, saveState, emptyWeek } from '../store';

function updateAndSave(prev: AppState, next: AppState): AppState {
  saveState(next);
  return next;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  const updateWeek = useCallback((weekKey: string, updater: (w: WeekData) => WeekData) => {
    setState(s => {
      const next = {
        ...s,
        weeks: {
          ...s.weeks,
          [weekKey]: updater(s.weeks[weekKey] || emptyWeek(weekKey)),
        },
      };
      return updateAndSave(s, next);
    });
  }, []);

  const setGoals = useCallback((goals: Goal[]) => {
    setState(s => updateAndSave(s, { ...s, goals }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => {
    setState(s => updateAndSave(s, { ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const replaceState = useCallback((newState: AppState) => {
    setState(s => updateAndSave(s, newState));
  }, []);

  return { state, updateWeek, setGoals, updateSettings, replaceState };
}
