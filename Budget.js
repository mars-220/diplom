import { useState, useMemo } from 'react';
import { CATEGORIES, CAT_ICONS } from '../constants';

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

function barColor(pct) {
  if (pct > 100) return '#ff6b6b';
  if (pct > 80)  return '#ffaa44';
  if (pct > 60)  return '#ffe066';
  return 'linear-gradient(90deg,#ff6ec7,#ff9dd7)';
}
function statusLabel(pct) {
  if (pct > 100) return { text: '⛔ Превышен',    color: '#ff6b6b' };
  if (pct > 80)  return { text: '⚠️ Почти лимит', color: '#ffaa44' };
  if (pct > 60)  return { text: '🟡 Осторожно',   color: '#ffe066' };
  return              { text: '✅ В норме',        color: '#7fff7f' };
}

export default function Budget({ transactions, budgets, setBudgets, currency, addToast }) {
  const [cat,   setCat]   = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const curMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const handleSet = (e) => {
    e.preventDefault();
    if (!limit || +limit <= 0) return;
    setBudgets(p => ({ ...p, [cat]: +limit }));
    addToast(`📊 Лимит установлен: ${cat} — ${Number(limit).toLocaleString('ru-RU')} ${currency}`, 'success');
    setLimit('');
  };

  const removeLimit = (c) => {
    setBudgets(p => { const n = { ...p }; delete n[c]; return n; });
    addToast(`Лимит по «${c}» удалён`, 'info');
  };

  // Per-category stats for current month
  const stats = useMemo(() => {
    const result = {};
    CATEGORIES.forEach(c => {
      const txs   = transactions.filter(t => t.type === 'expense' && t.category === c && t.date?.startsWith(curMonth));
      result[c] = { spent: txs.reduce((s, t) => s + t.amount, 0), count: txs.length };
    });
    return result;
  }, [transactions, curMonth]);

  const activeCats = CATEGORIES.filter(c => budgets[c]);

  // Overall utilisation
  const totalBudget = activeCats.reduce((s, c) => s + budgets[c], 0);
  const totalSpent  = activeCats.reduce((s, c) => s + stats[c].spent, 0);
  const overallPct  = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;
  const overCount   = activeCats.filter(c => stats[c].spent > budgets[c]).length;

  const fmt = (n) => n.toLocaleString('ru-RU') + ' ' + currency;

  return (
    <div>
      <h2 className="page-title">Бюджет</h2>

      {/* ── Overall summary ───────────────────────────────────── */}
      {activeCats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Общий бюджет', val: fmt(totalBudget), color: '#ffd1ee' },
            { label: 'Потрачено',    val: fmt(totalSpent),  color: overallPct > 80 ? '#ffaa44' : '#ff9ad8' },
            { label: 'Остаток',      val: fmt(Math.max(0, totalBudget - totalSpent)), color: '#7fff7f' },
            { label: 'Превышений',   val: overCount, color: overCount > 0 ? '#ff6b6b' : '#7fff7f' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card-lift" style={{ ...card({ textAlign: 'center' }) }}>
              <p style={{ margin: '0 0 5px', color: '#f5c0dc', fontSize: '0.82rem' }}>{label}</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Set limit form ────────────────────────────────────── */}
      <form onSubmit={handleSet} style={card({ marginBottom: 20 })}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Установить лимит</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', color: '#f5c0dc', fontSize: '0.8rem', marginBottom: 5 }}>Категория</label>
            <select style={inp} value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{CAT_ICONS[c]} {c}{budgets[c] ? ` (${budgets[c].toLocaleString('ru-RU')})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#f5c0dc', fontSize: '0.8rem', marginBottom: 5 }}>Лимит на месяц</label>
            <input style={inp} placeholder={`Сумма, ${currency}`} type="number" min="1" value={limit} onChange={e => setLimit(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '10px 22px', width: 'auto' }}>
            Сохранить
          </button>
        </div>
      </form>

      {/* ── Category limits ───────────────────────────────────── */}
      {activeCats.length === 0
        ? <div style={{ ...card({ textAlign: 'center', padding: '40px' }) }}>
            <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📊</p>
            <p style={{ color: '#f5c0dc', margin: 0 }}>Установите первый лимит, чтобы контролировать расходы</p>
          </div>
        : CATEGORIES.filter(c => budgets[c]).map(c => {
          const { spent, count } = stats[c];
          const lim  = budgets[c];
          const over = spent > lim;
          const { text: stText, color: stColor } = statusLabel(spent / lim * 100);

          return (
            <div key={c} className="card-lift" style={card({ marginBottom: 12 })}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{CAT_ICONS[c]}</span>
                  <div>
                    <p style={{ margin: 0, color: '#ffd1ee', fontWeight: 600 }}>{c}</p>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.76rem' }}>{count} транзакций в этом месяце</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: stColor, fontWeight: 600 }}>{stText}</span>
                  <button onClick={() => removeLimit(c)}
                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', opacity: 0.7 }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0.7}>✕</button>
                </div>
              </div>

              {/* Amount row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                <span style={{ color: '#f5c0dc' }}>
                  {spent.toLocaleString('ru-RU')} / {lim.toLocaleString('ru-RU')} {currency}
                </span>
                <span style={{ fontWeight: 700, color: over ? '#ff6b6b' : '#ffd1ee' }}>
                  {(spent / lim * 100).toFixed(0)}%
                </span>
              </div>

              {/* Bar */}
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, height: 10, overflow: 'hidden', marginBottom: over ? 8 : 0 }}>
                <div className="bar-fill" style={{
                  width: `${Math.min(spent / lim * 100, 100)}%`,
                  height: '100%', borderRadius: 8,
                  background: barColor(spent / lim * 100),
                  transition: 'width 0.5s',
                }} />
              </div>

              {over && (
                <p style={{ margin: '6px 0 0', color: '#ff8080', fontSize: '0.82rem' }}>
                  Перерасход: {(spent - lim).toLocaleString('ru-RU')} {currency}
                </p>
              )}
            </div>
          );
        })}
    </div>
  );
}
