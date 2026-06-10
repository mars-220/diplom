import { useState } from 'react';

const card = (extra = {}) => ({
  background: 'rgba(25,6,28,0.92)', border: '1px solid rgba(255,182,193,0.14)',
  borderRadius: '20px', padding: '22px', boxShadow: '0 8px 30px rgba(255,105,180,0.1)',
  ...extra,
});
const inp = {
  background: 'rgba(24,10,30,0.85)', border: '1px solid rgba(255,182,193,0.26)',
  borderRadius: '14px', color: '#ffe8ff', padding: '10px 14px', fontSize: '14px',
  width: '100%', fontFamily: 'inherit',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / 86400000);
}

function motivate(pct) {
  if (pct >= 100) return { text: 'Цель достигнута! 🎉', color: '#7fff7f' };
  if (pct >= 75)  return { text: 'Ещё чуть-чуть — финиш близко! 🔥', color: '#ffe066' };
  if (pct >= 50)  return { text: 'Больше половины пути позади! 💪', color: '#c77dff' };
  if (pct >= 25)  return { text: 'Хорошее начало, продолжайте! 🌱', color: '#ff9ad8' };
  return { text: 'Вы только начали — так держать! ✨', color: '#f5c0dc' };
}

export default function Goals({ goals, addGoal, updateGoal, deleteGoal, currency, addToast }) {
  const [name,       setName]       = useState('');
  const [target,     setTarget]     = useState('');
  const [deadline,   setDeadline]   = useState('');
  const [topUpAmt,   setTopUpAmt]   = useState({});
  const [sortBy,     setSortBy]     = useState('created'); // created | progress | deadline

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim() || !target || +target <= 0) return;
    addGoal({ name: name.trim(), target: +target, current: 0, deadline: deadline || null });
    addToast(`🎯 Цель создана: ${name.trim()}`, 'success');
    setName(''); setTarget(''); setDeadline('');
  };

  const handleTopUp = (g) => {
    const amt = +(topUpAmt[g.id] || 0);
    if (amt <= 0) return;
    updateGoal(g.id, amt);
    const newCurrent = Math.min(g.current + amt, g.target);
    if (newCurrent >= g.target) addToast(`🎉 Цель «${g.name}» достигнута!`, 'success');
    else addToast(`💰 Пополнено на ${amt.toLocaleString('ru-RU')} ${currency}`, 'info');
    setTopUpAmt(p => ({ ...p, [g.id]: '' }));
  };

  const handleDelete = (g) => {
    deleteGoal(g.id);
    addToast(`Цель «${g.name}» удалена`, 'info');
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (sortBy === 'progress') return (b.current / b.target) - (a.current / a.target);
    if (sortBy === 'deadline') {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return b.id - a.id; // created: newest first
  });

  const totalTarget  = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + g.current, 0);
  const completed    = goals.filter(g => g.current >= g.target).length;

  const fmt = (n) => n.toLocaleString('ru-RU') + ' ' + currency;

  return (
    <div>
      <h2 className="page-title">Цели</h2>

      {/* ── Summary ───────────────────────────────────────────── */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Всего целей',   val: `${completed} / ${goals.length}`, sub: 'достигнуто', color: '#c77dff' },
            { label: 'Накоплено',     val: fmt(totalCurrent), sub: `из ${fmt(totalTarget)}`, color: '#7fff7f' },
            { label: 'Осталось',      val: fmt(Math.max(0, totalTarget - totalCurrent)), sub: 'до всех целей', color: '#ff9ad8' },
          ].map(({ label, val, sub, color }) => (
            <div key={label} className="card-lift" style={{ ...card({ textAlign: 'center' }) }}>
              <p style={{ margin: '0 0 5px', color: '#f5c0dc', fontSize: '0.82rem' }}>{label}</p>
              <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '1.2rem', color }}>{val}</p>
              <p style={{ margin: 0, color: '#aaa', fontSize: '0.76rem' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Add form ──────────────────────────────────────────── */}
      <form onSubmit={handleAdd} style={card({ marginBottom: 20 })}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Новая цель</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          <input style={inp} placeholder="Название цели" value={name} onChange={e => setName(e.target.value)} required />
          <input style={inp} placeholder={`Сумма, ${currency}`} type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} required />
          <input style={inp} type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]} title="Дедлайн (необязательно)" />
        </div>
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
          Создать цель
        </button>
      </form>

      {/* ── Sort ─────────────────────────────────────────────── */}
      {goals.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={{ color: '#aaa', fontSize: '0.82rem', alignSelf: 'center' }}>Сортировка:</span>
          {[['created', 'По дате'], ['progress', 'По прогрессу'], ['deadline', 'По дедлайну']].map(([k, label]) => (
            <button key={k} onClick={() => setSortBy(k)} style={{
              padding: '5px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              background: sortBy === k ? 'linear-gradient(135deg,#ff6ec7,#ff9dd7)' : 'rgba(255,255,255,0.08)',
              color: sortBy === k ? '#fff' : '#f5c0dc', fontWeight: sortBy === k ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>
      )}

      {/* ── Goals list ────────────────────────────────────────── */}
      {sortedGoals.length === 0
        ? <div style={{ ...card({ textAlign: 'center', padding: '40px' }) }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>🎯</p>
            <p style={{ color: '#f5c0dc', margin: 0 }}>Создайте первую финансовую цель</p>
          </div>
        : sortedGoals.map(g => {
          const pct     = Math.min((g.current / g.target) * 100, 100);
          const days    = daysUntil(g.deadline);
          const motivMsg = motivate(pct);
          const overdue = days !== null && days < 0 && pct < 100;
          const urgent  = days !== null && days >= 0 && days <= 7 && pct < 100;

          return (
            <div key={g.id} className="card-lift" style={card({ marginBottom: 14 })}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p style={{ margin: 0, color: '#ffd1ee', fontWeight: 700, fontSize: '1.05rem' }}>{g.name}</p>
                  {g.deadline && (
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: overdue ? '#ff6b6b' : urgent ? '#ffcc55' : '#aaa' }}>
                      {overdue ? `⏰ Дедлайн прошёл ${Math.abs(days)} дн. назад`
                       : urgent ? `⚡ Осталось ${days} дн.`
                       : `📅 До ${g.deadline} · ещё ${days} дн.`}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(g)}
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1rem', opacity: 0.7 }}
                  onMouseEnter={e => e.target.style.opacity = 1}
                  onMouseLeave={e => e.target.style.opacity = 0.7}>✕</button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f5c0dc', fontSize: '0.85rem', marginBottom: 8 }}>
                <span>{g.current.toLocaleString('ru-RU')} / {g.target.toLocaleString('ru-RU')} {currency}</span>
                <span style={{ fontWeight: 700, color: motivMsg.color }}>{pct.toFixed(0)}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: 10 }}>
                <div className="bar-fill" style={{
                  width: `${pct}%`, height: '100%', borderRadius: 8,
                  background: pct >= 100
                    ? 'linear-gradient(90deg,#7fff7f,#56e87a)'
                    : overdue
                      ? 'linear-gradient(90deg,#ff6b6b,#ff9090)'
                      : 'linear-gradient(90deg,#ff6ec7,#ff9dd7)',
                }} />
              </div>

              {/* Motivation */}
              <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: motivMsg.color }}>{motivMsg.text}</p>

              {/* Top-up */}
              {pct < 100 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} type="number" min="1" placeholder="Сумма пополнения"
                    value={topUpAmt[g.id] || ''}
                    onChange={e => setTopUpAmt(p => ({ ...p, [g.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleTopUp(g)}
                  />
                  <button onClick={() => handleTopUp(g)} className="btn-primary" style={{ width: 'auto', padding: '10px 18px', flexShrink: 0 }}>
                    Пополнить
                  </button>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
