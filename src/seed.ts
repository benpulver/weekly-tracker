import type { Goal } from './types';

let id = 0;
const g = (
  name: string,
  points: number,
  loggingStyle: Goal['loggingStyle'],
  awardRule: Goal['awardRule'],
  opts: Partial<Goal> = {}
): Goal => ({
  id: `goal-${++id}`,
  name,
  points,
  loggingStyle,
  awardRule,
  order: id,
  ...opts,
});

export const seedGoals: Goal[] = [
  g('Sleep 7.5+ hrs', 10, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Journal 1–2×/day', 5, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Rogaine 2×/day (crown)', 2, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Phone < 1.5 hrs/day', 5, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Reading 1hr fiction + 1hr work', 5, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Protein 120g/day', 5, 'per-day-tick', 'count-of-days-gte', { target: 7 }),
  g('Gym session', 5, 'per-day-tick', 'count-of-days-gte', { target: 4, description: '≥20 min incl. 3–8 min plank + 30 push-ups' }),
  g('Flossing', 2, 'per-day-tick', 'count-of-days-gte', { target: 2 }),
  g('Retainer', 2, 'per-day-tick', 'count-of-days-gte', { target: 2 }),
  g('Yoga', 2, 'per-day-tick', 'count-of-days-gte', { target: 2 }),
  g('Sauna', 2, 'per-day-tick', 'count-of-days-gte', { target: 1 }),
  g('Running (km)', 10, 'per-day-number', 'sum-gte', { target: 35 }),
  g('PhD writing (pages)', 25, 'weekly-number', 'weekly-value-gte', { target: 21 }),
  g('RA work (hrs)', 10, 'weekly-number', 'weekly-value-gte', { target: 10 }),
  g('Peripheral work', 5, 'weekly-binary', 'weekly-binary'),
  g('Spending < $50/week', 5, 'weekly-binary', 'weekly-binary'),
];
