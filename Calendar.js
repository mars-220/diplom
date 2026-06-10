import { useState, useMemo } from 'react';
import { CAT_ICONS } from '../constants';

const MONTH_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW_RU   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const card = (extra = {}) => ({
  background: 'rgba(25,6,28,0.92)', border: '1px solid rgba(255,182,193,0.14)',
  borderRadius: '20px', padding: '22px', boxShadow: '0 8px 30px rgba(255,105,180,0.1)',
  ...extra,
});

const navBtn = {
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,182,193,0.18)',
  borderRadius: '12px', color: '#ffd1ee', cursor: 'pointer', padding: '8px 16px',
  fontSize: '1rem', fontWeight: 600, transition: 'background 0.15s',
};

export default function Calendar({ transactions, currency }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selDay, setSelDay] = useState(null);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelDay(null);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelDay(now.getDate()); };

  const pad = (n) => String(n).padStart(2, '0');
  const fmtKey = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

  // Spending & income maps
  const { spendMap, incMap, maxSpend, monthExp, monthInc } = useMemo(() => {
    const spendMap = {}, incMap = {};
    transactions.forEach(t => {
      if (!t.date?.startsWith(`${year}-${pad(month + 1)}`)) return;
      const d = parseInt(t.date.split('-')[2], 10);
      if (t.type === 'expense') spendMap[d] = (spendMap[d] || 0) + t.amount;
      else                      incMap[d]   = (incMap[d]   || 0) + t.amount;
    });
    const maxSpend  = Math.max(...Object.values(spendMap), 1);
    const monthExp  = Object.values(spendMap).reduce((s, v) => s + v, 0);
    const monthInc  = Object.values(incMap).reduce((s, v) => s + v, 0);
    return { spendMap, incMap, maxSpend, monthExp, monthInc };
  }, [transactions, year, month]); // eslint-disable-line

  // Calendar grid (Mon-first)
  const days = useMemo(() => {
    const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  const todayKey = now.toISOString().split('T')[0];
  const fmt = (n) => n.toLocaleString('ru-RU') + ' ' + currency;
  const selKey = selDay ? fmtKey(selDay) : null;
  const selTxs = selKey ? transactions.filter(t => t.date === selKey) : [];
  const selExp = selTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const selInc = selTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  // Most expensive day this month
  const busiestDay = Object.entries(spendMap).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <h2 className="page-title">Календарь</h2>

      {/* ── Month summary cards ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Доходы',     val: fmt(monthInc),  color: '#7fff7f' },
          { label: 'Расходы',    val: fmt(monthExp),  color: '#ff9ad8' },
          { label: 'Сохранено',  val: fmt(monthInc - monthExp), color: (monthInc - monthExp) >= 0 ? '#c77dff' : '#ff6b6b' },
          { label: 'Пик расходов', val: busiestDay ? `${busiestDay[0]} чис. · ${fmt(busiestDay[1])}` : '—', color: '#ffd1ee' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card-lift" style={{ ...card({ textAlign: 'center', padding: '16px' }) }}>
            <p style={{ margin: '0 0 4px', color: '#f5c0dc', fontSize: '0.78rem' }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 700, color, fontSize: '0.95rem' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* ── Calendar ──────────────────────────────────────────── */}
      <div style={card({ marginBottom: selDay ? 16 : 0 })}>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button style={navBtn} onClick={prevMonth}>←</button>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 4px', color: '#ffd1ee', fontSize: '1.25rem' }}>{MONTH_RU[month]} {year}</h3>
            <button onClick={goToday} style={{ background: 'none', border: 'none', color: '#ff9ad8', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
              Сегодня
            </button>
          </div>
          <button style={navBtn} onClick={nextMonth}>→</button>
        </div>

        {/* DOW header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {DOW_RU.map((d, i) => (
            <div key={d} style={{ textAlign: 'center', color: i >= 5 ? '#ff9ad8' : '#aaa', fontSize: '0.78rem', padding: '4px 0', fontWeight: 600 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {days.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const spend = spendMap[day] || 0;
            const hasInc = !!incMap[day];
            const intensity = spend > 0 ? 0.12 + (spend / maxSpend) * 0.72 : 0;
            const dateKey = fmtKey(day);
            const isToday   = dateKey === todayKey;
            const isSel     = selDay === day;
            const isWeekend = ((new Date(year, month, day).getDay() + 6) % 7) >= 5;
            return (
              <div
                key={day}
                className="cal-day"
                onClick={() => setSelDay(isSel ? null : day)}
                style={{
                  background: isSel
                    ? 'rgba(255,110,199,0.4)'
                    : spend > 0
                      ? `rgba(255,110,199,${intensity.toFixed(2)})`
                      : hasInc
                        ? 'rgba(127,255,127,0.1)'
                        : 'rgba(255,255,255,0.025)',
                  border: isToday
                    ? '1px solid rgba(255,110,199,0.7)'
                    : isSel
                      ? '1px solid rgba(255,110,199,0.5)'
                      : '1px solid transparent',
                }}
              >
                <div style={{
                  color: isSel ? '#fff' : isWeekend ? '#ff9ad8' : '#ffd1ee',
                  fontSize: '0.85rem',
                  fontWeight: isToday ? 800 : 400,
                }}>
                  {day}
                </div>
                {spend > 0 && (
                  <div style={{ color: isSel ? '#ffe8ff' : '#ffb3d9', fontSize: '0.62rem', marginTop: 2, lineHeight: 1.2 }}>
                    {spend >= 1000 ? `${(spend / 1000).toFixed(1)}к` : Math.round(spend)}
                  </div>
                )}
                {hasInc && !spend && (
                  <div style={{ color: '#7fff7f', fontSize: '0.62rem', marginTop: 2 }}>●</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginTop: 18, flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(255,110,199,0.2)', label: 'Малые расходы' },
            { color: 'rgba(255,110,199,0.6)', label: 'Средние расходы' },
            { color: 'rgba(255,110,199,0.9)', label: 'Крупные расходы' },
            { color: 'rgba(127,255,127,0.2)', label: 'Доход' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
              <span style={{ color: '#aaa', fontSize: '0.76rem' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Selected day ──────────────────────────────────────── */}
      {selDay && (
        <div className="card-lift" style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, color: '#ffd1ee' }}>
              {selDay} {MONTH_RU[month]} {year}
            </h3>
            <div style={{ display: 'flex', gap: 14, fontSize: '0.85rem' }}>
              {selInc > 0 && <span style={{ color: '#7fff7f' }}>+{fmt(selInc)}</span>}
              {selExp > 0 && <span style={{ color: '#ff9ad8' }}>−{fmt(selExp)}</span>}
            </div>
          </div>
          {selTxs.length === 0
            ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет транзакций в этот день</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selTxs.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                  }}>
                    <span style={{ color: '#ffd1ee' }}>
                      {CAT_ICONS[t.category]} {t.category}
                      {t.description && <span style={{ color: '#aaa', marginLeft: 8, fontSize: '0.85rem' }}>{t.description}</span>}
                    </span>
                    <span style={{ color: t.type === 'income' ? '#7fff7f' : '#ff9ad8', fontWeight: 700 }}>
                      {t.type === 'income' ? '+' : '−'}{t.amount.toLocaleString('ru-RU')} {currency}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
