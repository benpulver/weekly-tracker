import type { AppState } from '../types';
import { weekTotal, maxPoints } from '../store';
import { weekKeyToDate } from '../weekUtils';
import { format } from 'date-fns';

// re-export getWeek from store for history
export function HistoryView({ state, onNavigate }: { state: AppState; onNavigate: (key: string) => void }) {
  const max = maxPoints(state.goals);
  const weekKeys = Object.keys(state.weeks).sort().reverse();

  // group by month
  const months: Record<string, { keys: string[]; totals: number[] }> = {};
  for (const key of weekKeys) {
    const d = weekKeyToDate(key);
    const monthKey = format(d, 'yyyy-MM');
    if (!months[monthKey]) months[monthKey] = { keys: [], totals: [] };
    const total = weekTotal(state.goals, state.weeks[key]);
    months[monthKey].keys.push(key);
    months[monthKey].totals.push(total);
  }

  if (weekKeys.length === 0) {
    return <div className="history-view"><p className="empty">No weeks logged yet. Start tracking!</p></div>;
  }

  return (
    <div className="history-view">
      {Object.entries(months).map(([monthKey, { keys, totals }]) => {
        const avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
        const monthTotal = totals.reduce((a, b) => a + b, 0);
        return (
          <div key={monthKey} className="month-group">
            <div className="month-header">
              <span>{format(new Date(monthKey + '-01T00:00:00'), 'MMMM yyyy')}</span>
              <span className="month-stats">
                Avg: {avg}/{max} ({max > 0 ? Math.round((avg / max) * 100) : 0}%) · Total: {monthTotal}
              </span>
            </div>
            {keys.map(key => {
              const total = weekTotal(state.goals, state.weeks[key]);
              const pct = max > 0 ? Math.round((total / max) * 100) : 0;
              const d = weekKeyToDate(key);
              return (
                <button key={key} className="history-row" onClick={() => onNavigate(key)}>
                  <span className="history-week">{format(d, 'MMM d')} – {key}</span>
                  <span className="history-score">{total}/{max}</span>
                  <span className="history-pct">{pct}%</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
