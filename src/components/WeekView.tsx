import type { AppState, WeekData } from '../types';
import { getWeek, weekTotal, maxPoints } from '../store';
import { weekLabel, offsetWeek, currentWeekKey, weeksRemaining } from '../weekUtils';
import { GoalRow } from './GoalRow';

interface Props {
  state: AppState;
  weekKey: string;
  onWeekChange: (key: string) => void;
  onUpdate: (weekKey: string, updater: (w: WeekData) => WeekData) => void;
}

export function WeekView({ state, weekKey, onWeekChange, onUpdate }: Props) {
  const week = getWeek(state, weekKey);
  const total = weekTotal(state.goals, week);
  const max = maxPoints(state.goals);
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  const remaining = weeksRemaining(state.settings.programEndDate);

  return (
    <div className="week-view">
      <div className="week-nav">
        <button onClick={() => onWeekChange(offsetWeek(weekKey, -1))}>‹</button>
        <div className="week-info">
          <div className="week-label">{weekLabel(weekKey)}</div>
          {weekKey !== currentWeekKey() && (
            <button className="today-btn" onClick={() => onWeekChange(currentWeekKey())}>Today</button>
          )}
        </div>
        <button onClick={() => onWeekChange(offsetWeek(weekKey, 1))}>›</button>
      </div>

      <div className="score-banner">
        <div className="score-big">{total}<span className="score-max">/{max}</span></div>
        <div className="score-pct">{pct}%</div>
        <div className="weeks-left">{remaining} weeks remaining</div>
      </div>

      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="goals-list">
        {state.goals
          .sort((a, b) => a.order - b.order)
          .map(goal => (
            <GoalRow
              key={goal.id}
              goal={goal}
              week={week}
              onUpdate={updater => onUpdate(weekKey, updater)}
            />
          ))}
      </div>
    </div>
  );
}
