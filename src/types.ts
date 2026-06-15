export type LoggingStyle = 'per-day-tick' | 'per-day-number' | 'weekly-number' | 'weekly-binary';

export type AwardRule =
  | 'count-of-days-gte'      // per-day tick: ticked days >= target
  | 'sum-gte'                // per-day number: sum >= target
  | 'sum-lte'                // per-day number: sum <= target (lower is better)
  | 'days-meeting-threshold' // per-day number: days where value >= threshold, count >= requiredDays
  | 'weekly-value-gte'       // weekly number: value >= target
  | 'weekly-binary';         // weekly toggle: done = awarded

export interface Goal {
  id: string;
  name: string;
  description?: string;
  points: number;
  loggingStyle: LoggingStyle;
  awardRule: AwardRule;
  target?: number;          // threshold count or sum target
  threshold?: number;       // per-day threshold for days-meeting-threshold
  requiredDays?: number;    // how many days must meet threshold
  order: number;
}

export interface WeekData {
  weekKey: string; // e.g. "2026-W25"
  dailyTicks: Record<string, boolean[]>;   // goalId -> [mon..sun]
  dailyNumbers: Record<string, number[]>;  // goalId -> [mon..sun]
  weeklyNumbers: Record<string, number>;   // goalId -> value
  weeklyBinaries: Record<string, boolean>; // goalId -> done
}

export interface AppSettings {
  weekStartDay: number; // 1=Monday (ISO default)
  programEndDate: string; // ISO date string
}

export interface AppState {
  goals: Goal[];
  weeks: Record<string, WeekData>;
  settings: AppSettings;
}
