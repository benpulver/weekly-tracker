import type { AppState, WeekData, Goal } from './types';
import { seedGoals } from './seed';

const STORAGE_KEY = 'weekly-tracker-v1';

const defaultSettings = {
  weekStartDay: 1,
  programEndDate: '2026-08-31',
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt data, reset */ }
  return { goals: seedGoals, weeks: {}, settings: defaultSettings };
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function emptyWeek(weekKey: string): WeekData {
  return { weekKey, dailyTicks: {}, dailyNumbers: {}, weeklyNumbers: {}, weeklyBinaries: {} };
}

export function getWeek(state: AppState, weekKey: string): WeekData {
  return state.weeks[weekKey] || emptyWeek(weekKey);
}

export function computeScore(goal: Goal, week: WeekData): { earned: boolean; ratio: number; pointsEarned: number; progress: string } {
  let ratio = 0;
  let progress = '';

  switch (goal.awardRule) {
    case 'count-of-days-gte': {
      const ticks = week.dailyTicks[goal.id] || Array(7).fill(false);
      const count = ticks.filter(Boolean).length;
      const target = goal.target ?? 7;
      ratio = target > 0 ? Math.min(count / target, 1) : 0;
      progress = `${count}/${target} days`;
      break;
    }
    case 'sum-gte': {
      const nums = week.dailyNumbers[goal.id] || Array(7).fill(0);
      const sum = nums.reduce((a, b) => a + b, 0);
      const target = goal.target ?? 0;
      ratio = target > 0 ? Math.min(sum / target, 1) : 0;
      progress = `${Math.round(sum * 10) / 10}/${target}`;
      break;
    }
    case 'sum-lte': {
      const nums = week.dailyNumbers[goal.id] || Array(7).fill(0);
      const sum = nums.reduce((a, b) => a + b, 0);
      const target = goal.target ?? 0;
      ratio = sum <= target ? 1 : 0;
      progress = `$${Math.round(sum * 100) / 100}/$${target}`;
      break;
    }
    case 'days-meeting-threshold': {
      const nums = week.dailyNumbers[goal.id] || Array(7).fill(0);
      const threshold = goal.threshold ?? 0;
      const count = nums.filter(v => v >= threshold).length;
      const required = goal.requiredDays ?? 0;
      ratio = required > 0 ? Math.min(count / required, 1) : 0;
      progress = `${count}/${required} days ≥ ${threshold}`;
      break;
    }
    case 'weekly-value-gte': {
      const val = week.weeklyNumbers[goal.id] ?? 0;
      const target = goal.target ?? 0;
      ratio = target > 0 ? Math.min(val / target, 1) : 0;
      progress = `${val}/${target}`;
      break;
    }
    case 'weekly-binary': {
      const done = week.weeklyBinaries[goal.id] ?? false;
      ratio = done ? 1 : 0;
      progress = done ? 'Done' : 'Not done';
      break;
    }
  }

  const pointsEarned = Math.round(ratio * goal.points * 10) / 10;
  return { earned: ratio >= 1, ratio, pointsEarned, progress };
}

export function weekTotal(goals: Goal[], week: WeekData): number {
  const raw = goals.reduce((sum, g) => sum + computeScore(g, week).pointsEarned, 0);
  return Math.round(raw * 10) / 10;
}

export function maxPoints(goals: Goal[]): number {
  return goals.reduce((sum, g) => sum + g.points, 0);
}

export function exportData(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importData(json: string): AppState {
  return JSON.parse(json);
}
