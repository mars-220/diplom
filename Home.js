import { useState, useEffect, useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { CAT_ICONS } from '../constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* ── Animated counter hook ─────────────────────────────────────── */
function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(target);
  const rafRef  = useRef(null);
  const prevRef = useRef(target);

  useEffect(() => {
    const start = prevRef.current;
    prevRef.current = target;
    if (start === target) { setVal(target); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p    = Math.min((now - t0) / duration, 1);
      const ease = 1 - (1 - p) ** 3;
      setVal(Math.round(start + (target - start) * ease));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return val;
}

/* ── Financial health score ────────────────────────────────────── */
function calcHealth(transactions, budgets, goals) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const cur  = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const prev = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  })();

  const curInc  = transactions.filter(t => t.type === 'income'  && t.date?.startsWith(cur)).reduce((s, t) => s + t.amount, 0);
  const curExp  = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(cur)).reduce((s, t) => s + t.amount, 0);
  const prevExp = transactions.filter(t => t.type === 'expense' && t.date?.startsWith(prev)).reduce((s, t) => s + t.amount, 0);

  let score = 0;

  // Savings rate → up to 40 pts (20 % = full score)
  if (curInc > 0) score += Math.min(((curInc - curExp) / curInc) * 200, 40);
  else score += 10;

  // Budget compliance → up to 30 pts
  const budgetKeys = Object.keys(budgets);
  if (budgetKeys.length > 0) {
    const compliant = budgetKeys.filter(c => {
      const spent = transactions.filter(t => t.type === 'expense' && t.category === c && t.date?.startsWith(cur))
        .reduce((s, t) => s + t.amount, 0);
      return spent <= budgets[c];
    }).length;
    score += (compliant / budgetKeys.length) * 30;
  } else {
    score += 15;
  }

  // Active goals → up to 15 pts
  score += Math.min(goals.filter(g => g.current < g.target).length * 5, 15);

  // Expense trend → up to 15 pts
  if (prevExp > 0) score += curExp <= prevExp ? 15 : Math.max(0, 15 - ((curExp - prevExp) / prevExp) * 15);
  else score += 8;

  return Math.min(Math.round(score), 100);
}

/* ── Styles ─────────────────────────────────────────────────────── */
const card = (extra = {}) => ({
  background: 'rgba(25, 6, 28, 0.92)',
  border: '1px solid rgba(255, 182, 193, 0.14)',
  borderRadius: '20px',
  padding: '22px',
  boxShadow: '0 8px 30px rgba(255, 105, 180, 0.1)',
  ...extra,
});

/* ── Component ──────────────────────────────────────────────────── */
export default function Home({ transactions, goals, budgets, currency }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const curMonth  = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const prevDate  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;

  const curTx  = transactions.filter(t => t.date?.startsWith(curMonth));
  const prevTx = transactions.filter(t => t.date?.startsWith(prevMonth));

  const sum = (txs, type) => txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

  const thisInc  = sum(curTx,  'income');
  const thisExp  = sum(curTx,  'expense');
  const lastExp  = sum(prevTx, 'expense');
  const thisSav  = thisInc - thisExp;
  const savRate  = thisInc > 0 ? ((thisSav / thisInc) * 100).toFixed(1) : 0;
  const expTrend = lastExp > 0 ? ((thisExp - lastExp) / lastExp * 100) : null;

  const totalInc = sum(transactions, 'income');
  const totalExp = sum(transactions, 'expense');
  const balance  = totalInc - totalExp;
  const avgDaily = now.getDate() > 0 ? Math.round(thisExp / now.getDate()) : 0;

  // Animated values
  const animBalance  = useCountUp(balance);
  const animInc      = useCountUp(thisInc);
  const animExp      = useCountUp(thisExp);
  const animSavings  = useCountUp(thisSav);

  // Top categories this month
  const catMap = {};
  curTx.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Last 7 days chart
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key   = d.toISOString().split('T')[0];
      const spent = transactions.filter(t => t.type === 'expense' && t.date === key)
        .reduce((s, t) => s + t.amount, 0);
      days.push({ label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), spent });
    }
    return days;
  }, [transactions]); // eslint-disable-line

  const barData = {
    labels: last7.map(d => d.label),
    datasets: [{
      data: last7.map(d => d.spent),
      backgroundColor: last7.map(d => d.spent > 0 ? 'rgba(255,110,199,0.72)' : 'rgba(255,255,255,0.06)'),
      borderRadius: 8,
    }],
  };

  // Health score
  const score = useMemo(() => calcHealth(transactions, budgets, goals), [transactions, budgets, goals]);
  const scoreColor = score >= 80 ? '#7fff7f' : score >= 60 ? '#ffe066' : score >= 40 ? '#ffaa44' : '#ff6b6b';
  const scoreLabel = score >= 80 ? 'Отлично' : score >= 60 ? 'Хорошо' : score >= 40 ? 'Норм' : 'Нужно работать';

  // Budget alerts
  const overBudget = Object.entries(budgets).filter(([cat, lim]) => {
    const spent = curTx.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
    return spent > lim * 0.8;
  });

  const fmt = (n) => n.toLocaleString('ru-RU') + ' ' + currency;
  const recent = transactions.slice(0, 7);

  return (
    <div>
      <h2 className="page-title">Главная</h2>

      {/* ── Hero balance + health score ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 20 }}>
        <div className="card-lift" style={{ ...card({ padding: '28px 30px' }) }}>
          <p style={{ margin: '0 0 6px', color: '#f5c0dc', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Общий баланс
          </p>
          <p style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800, color: balance >= 0 ? '#7fff7f' : '#ff6b6b', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {animBalance.toLocaleString('ru-RU')} {currency}
          </p>
          <p style={{ margin: '8px 0 0', color: '#aaa', fontSize: '0.82rem' }}>
            {totalInc.toLocaleString('ru-RU')} доходов · {totalExp.toLocaleString('ru-RU')} расходов
          </p>
        </div>

        {/* Health gauge */}
        <div className="card-lift gauge-in" style={{ ...card({ padding: '20px 24px', textAlign: 'center', minWidth: 130 }) }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', margin: '0 auto 8px',
            background: `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'rgba(18,4,22,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800, color: scoreColor,
            }}>
              {score}
            </div>
          </div>
          <p style={{ margin: '0 0 2px', color: scoreColor, fontWeight: 600, fontSize: '0.85rem' }}>{scoreLabel}</p>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.75rem' }}>Фин. здоровье</p>
        </div>
      </div>

      {/* ── This month ─────────────────────────────────────────────── */}
      <p style={{ margin: '0 0 10px', color: '#f5c0dc', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
        Текущий месяц
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Доходы',     val: animInc,     color: '#7fff7f',  sub: null },
          { label: 'Расходы',    val: animExp,     color: '#ff9ad8',  sub: expTrend != null ? `${expTrend > 0 ? '▲' : '▼'} ${Math.abs(expTrend).toFixed(1)}% к прошлому` : null, subColor: expTrend > 0 ? '#ff6b6b' : '#7fff7f' },
          { label: 'Сохранено',  val: animSavings, color: thisSav >= 0 ? '#c77dff' : '#ff6b6b', sub: `${savRate}% нормы сбережений` },
          { label: 'Ср. / день', val: avgDaily,    color: '#ffd1ee',  sub: `${curTx.length} транзакций` },
        ].map(({ label, val, color, sub, subColor }) => (
          <div key={label} className="card-lift" style={{ ...card({ textAlign: 'center', padding: '18px 14px' }) }}>
            <p style={{ margin: '0 0 5px', color: '#f5c0dc', fontSize: '0.8rem' }}>{label}</p>
            <p style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 700, color }}>
              {val.toLocaleString('ru-RU')} {currency}
            </p>
            {sub && <p style={{ margin: 0, fontSize: '0.72rem', color: subColor || '#aaa' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Budget alerts ────────────────────────────────────────── */}
      {overBudget.length > 0 && (
        <div style={{ ...card({ marginBottom: 20, background: 'rgba(255,60,60,0.08)', borderColor: 'rgba(255,100,100,0.3)' }) }}>
          <p style={{ margin: '0 0 10px', color: '#ff9090', fontWeight: 600 }}>
            ⚠️ Предупреждения по бюджету
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {overBudget.map(([cat, lim]) => {
              const spent = curTx.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
              const pct = (spent / lim * 100).toFixed(0);
              return (
                <span key={cat} className="pulse" style={{
                  padding: '5px 12px', borderRadius: 10,
                  background: spent > lim ? 'rgba(255,70,70,0.2)' : 'rgba(255,170,50,0.15)',
                  color: spent > lim ? '#ff8080' : '#ffcc55',
                  fontSize: '0.82rem', fontWeight: 500,
                }}>
                  {CAT_ICONS[cat]} {cat}: {pct}% лимита
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Last 7 days chart ────────────────────────────────────── */}
      <div className="card-lift" style={{ ...card({ marginBottom: 20 }) }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Расходы за последние 7 дней</h3>
        <Bar data={barData} options={{
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString('ru-RU')} ${currency}` } } },
          scales: {
            x: { ticks: { color: '#f5c0dc', font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { color: '#f5c0dc', callback: v => v > 0 ? v.toLocaleString('ru-RU') : '' }, grid: { color: 'rgba(255,182,193,0.08)' } },
          },
        }} />
      </div>

      {/* ── Bottom grid: top categories + recent ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Top categories */}
        <div className="card-lift" style={card()}>
          <h3 style={{ margin: '0 0 14px', color: '#ffd1ee', fontSize: '0.95rem' }}>Топ расходов</h3>
          {topCats.length === 0
            ? <p style={{ color: '#f5c0dc', margin: 0, fontSize: '0.85rem' }}>Нет расходов</p>
            : topCats.map(([cat, amt]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#ffd1ee', fontSize: '0.85rem' }}>{CAT_ICONS[cat]} {cat}</span>
                  <span style={{ color: '#ff9ad8', fontSize: '0.85rem', fontWeight: 600 }}>{fmt(amt)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 4, height: 4 }}>
                  <div className="bar-fill" style={{ width: `${(amt / (topCats[0][1] || 1)) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#ff6ec7,#ff9dd7)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
        </div>

        {/* Recent transactions */}
        <div className="card-lift" style={card()}>
          <h3 style={{ margin: '0 0 14px', color: '#ffd1ee', fontSize: '0.95rem' }}>Последние транзакции</h3>
          {recent.length === 0
            ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет транзакций — добавьте первую кнопкой «+»</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {recent.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 13px', background: 'rgba(255,255,255,0.04)', borderRadius: 11,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: '1rem' }}>{CAT_ICONS[t.category]}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, color: '#ffd1ee', fontSize: '0.85rem', fontWeight: 500 }}>{t.category}</p>
                        <p style={{ margin: 0, color: '#aaa', fontSize: '0.74rem' }}>
                          {t.date}{t.description ? ` · ${t.description}` : ''}
                        </p>
                      </div>
                    </div>
                    <span style={{ color: t.type === 'income' ? '#7fff7f' : '#ff9ad8', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, marginLeft: 8 }}>
                      {t.type === 'income' ? '+' : '−'}{t.amount.toLocaleString('ru-RU')} {currency}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
