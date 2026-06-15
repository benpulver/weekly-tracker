import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { WeekView } from './components/WeekView';
import { HistoryView } from './components/HistoryView';
import { ChartsView } from './components/ChartsView';
import { SettingsView } from './components/SettingsView';
import { currentWeekKey } from './weekUtils';
import './App.css';

type Tab = 'week' | 'history' | 'charts' | 'settings';

export default function App() {
  const { state, updateWeek, setGoals, updateSettings, replaceState } = useAppState();
  const [tab, setTab] = useState<Tab>('week');
  const [weekKey, setWeekKey] = useState(currentWeekKey);

  const navigateToWeek = (key: string) => {
    setWeekKey(key);
    setTab('week');
  };

  return (
    <div className="app">
      <header>
        <h1>Weekly Tracker</h1>
      </header>

      <main>
        {tab === 'week' && (
          <WeekView
            state={state}
            weekKey={weekKey}
            onWeekChange={setWeekKey}
            onUpdate={updateWeek}
          />
        )}
        {tab === 'history' && <HistoryView state={state} onNavigate={navigateToWeek} />}
        {tab === 'charts' && <ChartsView state={state} />}
        {tab === 'settings' && (
          <SettingsView
            state={state}
            onSetGoals={setGoals}
            onUpdateSettings={updateSettings}
            onReplaceState={replaceState}
          />
        )}
      </main>

      <nav className="tab-bar">
        {(['week', 'history', 'charts', 'settings'] as Tab[]).map(t => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'week' ? '📋' : t === 'history' ? '📊' : t === 'charts' ? '📈' : '⚙️'}
            <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
