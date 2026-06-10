import { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const CATEGORIES = [
  'Продукты', 'Транспорт', 'Развлечения', 'Коммуналка',
  'Зарплата', 'Инвестиции', 'Здоровье', 'Образование',
  'Путешествия', 'Подписки', 'Подарки', 'Прочее',
];
const CAT_COLORS = [
  '#ff6ec7', '#ff9dd7', '#ff72c2', '#c77dff',
  '#9d4edd', '#ff85a1', '#ffd6e7', '#ffb3c6',
  '#a78bfa', '#ff4d6d', '#c9184a', '#ff0054',
];

const card = {
  background: 'rgba(25, 6, 28, 0.92)',
  border: '1px solid rgba(255, 182, 193, 0.14)',
  borderRadius: '20px',
  padding: '22px',
  boxShadow: '0 8px 30px rgba(255, 105, 180, 0.1)',
};

const axis = {
  ticks: { color: '#f5c0dc' },
  grid: { color: 'rgba(255,182,193,0.1)' },
};

const legendLabels = { color: '#f5c0dc' };

const PERIODS = [
  { id: '1m', label: '1М' },
  { id: '3m', label: '3М' },
  { id: '6m', label: '6М' },
  { id: '1y', label: '1Г' },
  { id: 'all', label: 'Всё' },
];

export default function Analytics({ transactions, currency }) {
  const [period, setPeriod] = useState('all');

  const now = new Date();
  const msMap = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 };

  const filtered = period === 'all'
    ? transactions
    : transactions.filter(t => {
        if (!t.date) return false;
        return (now - new Date(t.date)) <= msMap[period] * 86400000;
      });

  const expenses = filtered.filter(t => t.type === 'expense');
  const incomes = filtered.filter(t => t.type === 'income');

  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInc = incomes.reduce((s, t) => s + t.amount, 0);
  const maxExp = expenses.reduce((m, t) => (t.amount > m ? t.amount : m), 0);
  const avgTx = expenses.length ? Math.round(totalExp / expenses.length) : 0;

  const fmt = (n) => Number(n).toLocaleString('ru-RU') + ' ' + currency;

  // ── Monthly cashflow ──────────────────────────────────────────────────────
  const months = {};
  filtered.forEach(t => {
    const m = t.date?.substring(0, 7) ?? '?';
    if (!months[m]) months[m] = { income: 0, expense: 0 };
    months[m][t.type] += t.amount;
  });
  const sortedMonths = Object.keys(months).sort();

  const cashflowData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Доходы',
        data: sortedMonths.map(m => months[m].income),
        backgroundColor: 'rgba(127,255,127,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Расходы',
        data: sortedMonths.map(m => months[m].expense),
        backgroundColor: 'rgba(255,154,216,0.7)',
        borderRadius: 6,
      },
    ],
  };

  // ── Running balance ───────────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  let running = 0;
  const balanceByDate = {};
  sorted.forEach(t => {
    running += t.type === 'income' ? t.amount : -t.amount;
    balanceByDate[t.date] = running;
  });
  const balanceDates = Object.keys(balanceByDate).sort();

  const balanceData = {
    labels: balanceDates,
    datasets: [{
      label: 'Баланс',
      data: balanceDates.map(d => balanceByDate[d]),
      borderColor: '#ff72c2',
      backgroundColor: 'rgba(255,114,194,0.15)',
      tension: 0.4,
      fill: true,
      pointRadius: balanceDates.length > 40 ? 0 : 3,
      pointHoverRadius: 5,
    }],
  };

  // ── Category doughnut ─────────────────────────────────────────────────────
  const catTotals = CATEGORIES.map(c =>
    expenses.filter(t => t.category === c).reduce((s, t) => s + t.amount, 0)
  );
  const nonZero = CATEGORIES
    .map((c, i) => ({ c, v: catTotals[i], color: CAT_COLORS[i] }))
    .filter(x => x.v > 0)
    .sort((a, b) => b.v - a.v);

  const doughnutData = {
    labels: nonZero.map(x => x.c),
    datasets: [{
      data: nonZero.map(x => x.v),
      backgroundColor: nonZero.map(x => x.color),
      borderWidth: 0,
    }],
  };

  // ── Day-of-week spending ──────────────────────────────────────────────────
  const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dowData = new Array(7).fill(0);
  expenses.forEach(t => {
    if (t.date) dowData[new Date(t.date).getDay()] += t.amount;
  });

  const dowChartData = {
    labels: DOW,
    datasets: [{
      data: dowData,
      backgroundColor: DOW.map((_, i) => {
        const max = Math.max(...dowData);
        const alpha = max > 0 ? 0.3 + 0.5 * (dowData[i] / max) : 0.3;
        return `rgba(255,110,199,${alpha.toFixed(2)})`;
      }),
      borderRadius: 8,
    }],
  };

  const chartOpts = {
    plugins: { legend: { labels: legendLabels } },
    scales: { x: axis, y: axis },
  };

  return (
    <div>
      {/* Header + period filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Аналитика</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{
              padding: '6px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              background: period === p.id
                ? 'linear-gradient(135deg, #ff6ec7, #ff9dd7)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff', fontWeight: period === p.id ? 700 : 400,
              transition: 'background 0.2s',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Доходы', v: fmt(totalInc), c: '#7fff7f' },
          { label: 'Расходы', v: fmt(totalExp), c: '#ff9ad8' },
          { label: 'Макс. расход', v: fmt(maxExp), c: '#ffd1ee' },
          { label: 'Ср. чек', v: fmt(avgTx), c: '#c77dff' },
        ].map(({ label, v, c }) => (
          <div key={label} style={{ ...card, textAlign: 'center' }}>
            <p style={{ margin: '0 0 5px', color: '#f5c0dc', fontSize: '0.82rem' }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Balance over time */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Динамика баланса</h3>
        {balanceDates.length > 0
          ? <Line data={balanceData} options={chartOpts} />
          : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>}
      </div>

      {/* Monthly cashflow */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Доходы vs расходы по месяцам</h3>
        {sortedMonths.length > 0
          ? <Bar data={cashflowData} options={chartOpts} />
          : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>}
      </div>

      {/* Category doughnut + day-of-week */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Расходы по категориям</h3>
          {nonZero.length > 0
            ? <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: legendLabels } } }} />
            : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет расходов</p>}
        </div>
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Расходы по дням недели</h3>
          <Bar
            data={dowChartData}
            options={{
              plugins: { legend: { display: false } },
              scales: { x: axis, y: axis },
            }}
          />
        </div>
      </div>

      {/* Top categories table */}
      <div style={card}>
        <h3 style={{ margin: '0 0 18px', color: '#ffd1ee' }}>Топ категорий расходов</h3>
        {nonZero.length === 0
          ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {nonZero.map((x, i) => {
                const pct = totalExp > 0 ? (x.v / totalExp * 100).toFixed(1) : 0;
                return (
                  <div key={x.c}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: '#ffd1ee', fontWeight: 500 }}>
                        <span style={{ color: x.color, marginRight: 6 }}>●</span>
                        {i + 1}. {x.c}
                      </span>
                      <span style={{ color: '#f5c0dc' }}>
                        {fmt(x.v)}&nbsp;
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, height: 7 }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: x.color, borderRadius: 6,
                        transition: 'width 0.4s',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
