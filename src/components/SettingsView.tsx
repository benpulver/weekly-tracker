import { useState } from 'react';
import type { AppState, Goal, LoggingStyle, AwardRule } from '../types';
import { exportData, importData, maxPoints } from '../store';

interface Props {
  state: AppState;
  onSetGoals: (goals: Goal[]) => void;
  onUpdateSettings: (patch: Partial<AppState['settings']>) => void;
  onReplaceState: (s: AppState) => void;
}

const LOGGING_STYLES: { value: LoggingStyle; label: string }[] = [
  { value: 'per-day-tick', label: 'Per-day (tick)' },
  { value: 'per-day-number', label: 'Per-day (number)' },
  { value: 'weekly-number', label: 'Weekly (number)' },
  { value: 'weekly-binary', label: 'Weekly (toggle)' },
];

const AWARD_RULES: Record<LoggingStyle, { value: AwardRule; label: string }[]> = {
  'per-day-tick': [{ value: 'count-of-days-gte', label: 'Days ticked ≥ target' }],
  'per-day-number': [
    { value: 'sum-gte', label: 'Sum ≥ target' },
    { value: 'sum-lte', label: 'Sum ≤ target (lower is better)' },
    { value: 'days-meeting-threshold', label: 'Days meeting threshold ≥ required' },
  ],
  'weekly-number': [{ value: 'weekly-value-gte', label: 'Value ≥ target' }],
  'weekly-binary': [{ value: 'weekly-binary', label: 'Binary (done/not)' }],
};

function GoalEditor({ goal, onChange, onDelete }: {
  goal: Goal;
  onChange: (g: Goal) => void;
  onDelete: () => void;
}) {
  const rules = AWARD_RULES[goal.loggingStyle];

  return (
    <div className="goal-editor">
      <div className="editor-row">
        <input
          className="goal-name-input"
          value={goal.name}
          onChange={e => onChange({ ...goal, name: e.target.value })}
          placeholder="Goal name"
        />
        <input
          type="number"
          className="pts-input"
          value={goal.points}
          onChange={e => onChange({ ...goal, points: parseInt(e.target.value) || 0 })}
          min="0"
        />
        <span className="pts-label">pts</span>
      </div>
      <input
        className="desc-input"
        value={goal.description || ''}
        onChange={e => onChange({ ...goal, description: e.target.value || undefined })}
        placeholder="Description (optional)"
      />
      <div className="editor-row">
        <select
          value={goal.loggingStyle}
          onChange={e => {
            const ls = e.target.value as LoggingStyle;
            const newRules = AWARD_RULES[ls];
            onChange({ ...goal, loggingStyle: ls, awardRule: newRules[0].value });
          }}
        >
          {LOGGING_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={goal.awardRule}
          onChange={e => onChange({ ...goal, awardRule: e.target.value as AwardRule })}
        >
          {rules.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div className="editor-row">
        {(goal.awardRule === 'count-of-days-gte' || goal.awardRule === 'sum-gte' || goal.awardRule === 'sum-lte' || goal.awardRule === 'weekly-value-gte') && (
          <label>
            Target:
            <input type="number" value={goal.target ?? ''} onChange={e => onChange({ ...goal, target: parseFloat(e.target.value) || 0 })} min="0" />
          </label>
        )}
        {goal.awardRule === 'days-meeting-threshold' && (
          <>
            <label>
              Threshold:
              <input type="number" value={goal.threshold ?? ''} onChange={e => onChange({ ...goal, threshold: parseFloat(e.target.value) || 0 })} min="0" />
            </label>
            <label>
              Required days:
              <input type="number" value={goal.requiredDays ?? ''} onChange={e => onChange({ ...goal, requiredDays: parseInt(e.target.value) || 0 })} min="0" max="7" />
            </label>
          </>
        )}
      </div>
      <button className="delete-btn" onClick={onDelete}>Delete goal</button>
    </div>
  );
}

export function SettingsView({ state, onSetGoals, onUpdateSettings, onReplaceState }: Props) {
  const [importText, setImportText] = useState('');
  const total = maxPoints(state.goals);

  const updateGoal = (idx: number, g: Goal) => {
    const next = [...state.goals];
    next[idx] = g;
    onSetGoals(next);
  };

  const addGoal = () => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: 'New goal',
      points: 5,
      loggingStyle: 'per-day-tick',
      awardRule: 'count-of-days-gte',
      target: 7,
      order: state.goals.length + 1,
    };
    onSetGoals([...state.goals, newGoal]);
  };

  const deleteGoal = (idx: number) => {
    if (confirm(`Delete "${state.goals[idx].name}"?`)) {
      onSetGoals(state.goals.filter((_, i) => i !== idx));
    }
  };

  const doExport = () => {
    const blob = new Blob([exportData(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      const data = importData(importText);
      if (data.goals && data.settings) {
        onReplaceState(data);
        setImportText('');
        alert('Import successful!');
      } else {
        alert('Invalid data format');
      }
    } catch {
      alert('Invalid JSON');
    }
  };

  return (
    <div className="settings-view">
      <div className="settings-section">
        <h3>Program end date</h3>
        <input
          type="date"
          value={state.settings.programEndDate}
          onChange={e => onUpdateSettings({ programEndDate: e.target.value })}
        />
      </div>

      <div className="settings-section">
        <h3>
          Goals
          <span className={`total-badge ${total !== 100 ? 'warn' : ''}`}>
            Total: {total} pts {total !== 100 && '⚠'}
          </span>
        </h3>
        {state.goals.map((g, i) => (
          <GoalEditor
            key={g.id}
            goal={g}
            onChange={updated => updateGoal(i, updated)}
            onDelete={() => deleteGoal(i)}
          />
        ))}
        <button className="add-btn" onClick={addGoal}>+ Add goal</button>
      </div>

      <div className="settings-section">
        <h3>Export / Import</h3>
        <button className="export-btn" onClick={doExport}>Export JSON</button>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Paste JSON here to import..."
          rows={4}
        />
        {importText && <button className="import-btn" onClick={doImport}>Import</button>}
      </div>
    </div>
  );
}
