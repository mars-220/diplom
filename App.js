import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Auth from './components/Auth';
import Home from './components/Home';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import Savings from './components/Savings';
import Goals from './components/Goals';
import Budget from './components/Budget';
import Statistics from './components/Statistics';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import { CATEGORIES, CAT_ICONS } from './constants';
import { SEED_TRANSACTIONS, SEED_GOALS, SEED_BUDGETS } from './seedData';

const PAGES = [
  { id: 'home',         label: '🏠', title: 'Главная' },
  { id: 'transactions', label: '💸', title: 'Транзакции' },
  { id: 'calendar',     label: '📅', title: 'Календарь' },
  { id: 'analytics',    label: '🔍', title: 'Аналитика' },
  { id: 'savings',      label: '💎', title: 'Накопления' },
  { id: 'goals',        label: '🎯', title: 'Цели' },
  { id: 'budget',       label: '📊', title: 'Бюджет' },
  { id: 'statistics',   label: '📈', title: 'Статистика' },
  { id: 'settings',     label: '⚙️', title: 'Настройки' },
];

const PAGE_COMPONENTS = {
  home: Home, transactions: Transactions, calendar: Calendar,
  analytics: Analytics, savings: Savings, goals: Goals,
  budget: Budget, statistics: Statistics, settings: Settings,
};

const inp = {
  background: 'rgba(24,10,30,0.85)',
  border: '1px solid rgba(255,182,193,0.26)',
  borderRadius: '12px',
  color: '#ffe8ff',
  padding: '9px 12px',
  fontSize: '14px',
  width: '100%',
  fontFamily: 'inherit',
};

export default function App() {
  // ── Persistent state ────────────────────────────────────────────
  const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };

  const [user,         setUser]         = useState(() => load('rf_user', null));
  const [page,         setPage]         = useState('home');
  const [transactions, setTransactions] = useState(() => load('rf_transactions', []));
  const [goals,        setGoals]        = useState(() => load('rf_goals', []));
  const [budgets,      setBudgets]      = useState(() => load('rf_budgets', {}));
  const [settings,     setSettings]     = useState(() => load('rf_settings', { currency: '₽' }));

  useEffect(() => { localStorage.setItem('rf_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('rf_goals',        JSON.stringify(goals));        }, [goals]);
  useEffect(() => { localStorage.setItem('rf_budgets',      JSON.stringify(budgets));      }, [budgets]);
  useEffect(() => { localStorage.setItem('rf_settings',     JSON.stringify(settings));     }, [settings]);

  // ── Auto-seed demo data on first login ──────────────────────────
  useEffect(() => {
    if (user && transactions.length === 0 && !load('rf_seeded', false)) {
      setTransactions(SEED_TRANSACTIONS);
      setGoals(SEED_GOALS);
      setBudgets(SEED_BUDGETS);
      localStorage.setItem('rf_seeded', 'true');
    }
  }, [user]); // eslint-disable-line

  // ── Actions ─────────────────────────────────────────────────────
  const addTransaction    = useCallback((t) => setTransactions(p => [{ ...t, id: Date.now() }, ...p]), []);
  const deleteTransaction = useCallback((id) => setTransactions(p => p.filter(t => t.id !== id)), []);
  const addGoal     = useCallback((g) => setGoals(p => [...p, { ...g, id: Date.now() }]), []);
  const updateGoal  = useCallback((id, amt) => setGoals(p => p.map(g => g.id === id ? { ...g, current: Math.min(g.current + amt, g.target) } : g)), []);
  const deleteGoal  = useCallback((id) => setGoals(p => p.filter(g => g.id !== id)), []);

  // ── Toast ────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3600);
  }, []);

  // ── FAB quick-add ────────────────────────────────────────────────
  const [fabOpen, setFabOpen] = useState(false);
  const [fab, setFab] = useState({ type: 'expense', amount: '', category: CATEGORIES[0], description: '' });

  const submitFab = (e) => {
    e.preventDefault();
    if (!fab.amount || +fab.amount <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    addTransaction({ type: fab.type, amount: +fab.amount, category: fab.category, description: fab.description, date: today });
    addToast(
      `${CAT_ICONS[fab.category]} ${fab.type === 'income' ? '+' : '−'} ${Number(fab.amount).toLocaleString('ru-RU')} ${settings.currency} · ${fab.category}`,
      fab.type === 'income' ? 'success' : 'expense',
    );
    setFab({ type: 'expense', amount: '', category: CATEGORIES[0], description: '' });
    setFabOpen(false);
  };

  // ── Reset to demo data ───────────────────────────────────────────
  const resetToDemo = useCallback(() => {
    setTransactions(SEED_TRANSACTIONS);
    setGoals(SEED_GOALS);
    setBudgets(SEED_BUDGETS);
    localStorage.setItem('rf_seeded', 'true');
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = () => { localStorage.removeItem('rf_user'); setUser(null); };

  if (!user) {
    return <Auth onLogin={(u) => { localStorage.setItem('rf_user', JSON.stringify(u)); setUser(u); }} />;
  }

  // ── Sidebar balance ──────────────────────────────────────────────
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = totalInc - totalExp;

  const pageProps = {
    transactions, goals, budgets, settings, currency: settings.currency,
    addTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal,
    setBudgets, setSettings, addToast, resetToDemo,
  };
  const PageComponent = PAGE_COMPONENTS[page];

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 style={{ fontSize: '1.6rem', margin: '0 0 4px' }}>💰 Finance</h1>
          <p style={{ margin: 0, color: '#f5c0dc', fontSize: '0.82rem' }}>{user.name}</p>
          <p className="sidebar-balance" style={{ color: balance >= 0 ? '#7fff7f' : '#ff6b6b' }}>
            {balance.toLocaleString('ru-RU')} {settings.currency}
          </p>
        </div>

        <nav className="sidebar-nav">
          {PAGES.map(p => (
            <button
              key={p.id}
              className={page === p.id ? 'active' : ''}
              onClick={() => setPage(p.id)}
            >
              <span style={{ marginRight: 8 }}>{p.label}</span>{p.title}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={logout} style={{ opacity: 0.55 }}>🚪 Выйти</button>
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="main">
        <div key={page} className="page-enter">
          <PageComponent {...pageProps} />
        </div>
      </main>

      {/* ── FAB ── */}
      {!fabOpen && (
        <button className="fab" onClick={() => setFabOpen(true)} title="Быстро добавить транзакцию">
          +
        </button>
      )}

      {/* ── FAB panel ── */}
      {fabOpen && (
        <div className="fab-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ color: '#ffd1ee', fontWeight: 600, fontSize: '0.95rem' }}>Быстрое добавление</span>
            <button onClick={() => setFabOpen(false)}
              style={{ background: 'none', border: 'none', color: '#f5c0dc', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>
              ✕
            </button>
          </div>
          <form onSubmit={submitFab}>
            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[['expense', '− Расход'], ['income', '+ Доход']].map(([t, label]) => (
                <button key={t} type="button"
                  onClick={() => setFab(p => ({ ...p, type: t }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: '0.83rem', fontWeight: 700,
                    background: fab.type === t ? (t === 'income' ? 'rgba(127,255,127,0.85)' : 'rgba(255,110,199,0.85)') : 'rgba(255,255,255,0.07)',
                    color: fab.type === t ? '#111' : '#f5c0dc',
                    transition: 'background 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            <input className="inp" style={{ ...inp, marginBottom: 8 }}
              placeholder={`Сумма, ${settings.currency}`}
              type="number" min="0.01" step="0.01"
              value={fab.amount}
              onChange={e => setFab(p => ({ ...p, amount: e.target.value }))}
              required autoFocus
            />
            <select className="inp" style={{ ...inp, marginBottom: 8 }}
              value={fab.category}
              onChange={e => setFab(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <input className="inp" style={{ ...inp, marginBottom: 14 }}
              placeholder="Описание (необязательно)"
              value={fab.description}
              onChange={e => setFab(p => ({ ...p, description: e.target.value }))}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px' }}>
              Добавить
            </button>
          </form>
        </div>
      )}

      {/* ── Toast container ── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
