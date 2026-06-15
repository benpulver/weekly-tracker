import type { AppState } from '../types';
import { weekTotal, maxPoints } from '../store';
import { weekKeyToDate } from '../weekUtils';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function ChartsView({ state }: { state: AppState }) {
  const max = maxPoints(state.goals);
  const weekKeys = Object.keys(state.weeks).sort();

  const weekData = weekKeys.map(key => ({
    name: format(weekKeyToDate(key), 'MMM d'),
    score: weekTotal(state.goals, state.weeks[key]),
    pct: max > 0 ? Math.round((weekTotal(state.goals, state.weeks[key]) / max) * 100) : 0,
  }));

  // Monthly averages
  const months: Record<string, number[]> = {};
  for (const key of weekKeys) {
    const d = weekKeyToDate(key);
    const m = format(d, 'MMM yyyy');
    if (!months[m]) months[m] = [];
    months[m].push(weekTotal(state.goals, state.weeks[key]));
  }
  const monthData = Object.entries(months).map(([name, scores]) => ({
    name,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  if (weekKeys.length === 0) {
    return <div className="charts-view"><p className="empty">No data yet — check back after your first week.</p></div>;
  }

  return (
    <div className="charts-view">
      <h3>Weekly Score</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, max]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <h3>Monthly Average</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={monthData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, max]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="avg" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
