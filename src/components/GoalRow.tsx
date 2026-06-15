import type { Goal, WeekData } from '../types';
import { computeScore } from '../store';
import { DAY_LABELS } from '../weekUtils';

interface Props {
  goal: Goal;
  week: WeekData;
  onUpdate: (updater: (w: WeekData) => WeekData) => void;
}

export function GoalRow({ goal, week, onUpdate }: Props) {
  const { earned, pointsEarned, progress } = computeScore(goal, week);

  const toggleTick = (dayIdx: number) => {
    onUpdate(w => {
      const ticks = [...(w.dailyTicks[goal.id] || Array(7).fill(false))];
      ticks[dayIdx] = !ticks[dayIdx];
      return { ...w, dailyTicks: { ...w.dailyTicks, [goal.id]: ticks } };
    });
  };

  const setDayNumber = (dayIdx: number, val: number) => {
    onUpdate(w => {
      const nums = [...(w.dailyNumbers[goal.id] || Array(7).fill(0))];
      nums[dayIdx] = val;
      return { ...w, dailyNumbers: { ...w.dailyNumbers, [goal.id]: nums } };
    });
  };

  const setWeeklyNumber = (val: number) => {
    onUpdate(w => ({ ...w, weeklyNumbers: { ...w.weeklyNumbers, [goal.id]: val } }));
  };

  const toggleWeekly = () => {
    onUpdate(w => ({
      ...w,
      weeklyBinaries: { ...w.weeklyBinaries, [goal.id]: !w.weeklyBinaries[goal.id] },
    }));
  };

  return (
    <div className={`goal-row ${earned ? 'earned' : pointsEarned > 0 ? 'partial' : ''}`}>
      <div className="goal-header">
        <span className="goal-name">{goal.name}</span>
        <span className="goal-pts">{pointsEarned}/{goal.points} pts</span>
      </div>
      {goal.description && <div className="goal-desc">{goal.description}</div>}

      {goal.loggingStyle === 'per-day-tick' && (
        <div className="day-cells">
          {DAY_LABELS.map((d, i) => {
            const ticks = week.dailyTicks[goal.id] || Array(7).fill(false);
            return (
              <button
                key={d}
                className={`day-cell tick ${ticks[i] ? 'checked' : ''}`}
                onClick={() => toggleTick(i)}
                aria-label={`${d} ${ticks[i] ? 'done' : 'not done'}`}
              >
                <span className="day-label">{d}</span>
                <span className="tick-mark">{ticks[i] ? '✓' : ''}</span>
              </button>
            );
          })}
          <span className="tally">{progress}</span>
        </div>
      )}

      {goal.loggingStyle === 'per-day-number' && (
        <div className="day-cells">
          {DAY_LABELS.map((d, i) => {
            const nums = week.dailyNumbers[goal.id] || Array(7).fill(0);
            return (
              <div key={d} className="day-cell number">
                <span className="day-label">{d}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={nums[i] || ''}
                  onChange={e => setDayNumber(i, parseFloat(e.target.value) || 0)}
                  aria-label={`${d} value`}
                />
              </div>
            );
          })}
          <span className="tally">{progress}</span>
        </div>
      )}

      {goal.loggingStyle === 'weekly-number' && (
        <div className="weekly-input">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={week.weeklyNumbers[goal.id] ?? ''}
            onChange={e => setWeeklyNumber(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <span className="tally">{progress}</span>
        </div>
      )}

      {goal.loggingStyle === 'weekly-binary' && (
        <div className="weekly-input">
          <button
            className={`toggle-btn ${week.weeklyBinaries[goal.id] ? 'on' : ''}`}
            onClick={toggleWeekly}
          >
            {week.weeklyBinaries[goal.id] ? '✓ Done' : 'Mark done'}
          </button>
        </div>
      )}
    </div>
  );
}
