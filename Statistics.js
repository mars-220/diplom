import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler,
);

const CATEGORIES = [
  'Продукты', 'Транспорт', 'Развлечения', 'Коммуналка',
  'Зарплата', 'Инвестиции', 'Здоровье', 'Образование',
  'Путешествия', 'Подписки', 'Подарки', 'Прочее',
];
const COLORS = [
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

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...card, textAlign: 'center' }}>
      <p style={{ margin: '0 0 6px', color: '#f5c0dc', fontSize: '0.85rem' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color }}>{value}</p>
    </div>
  );
}

export default function Statistics({ transactions, currency }) {
  const fmt = (n) => Number(n).toLocaleString('ru-RU') + ' ' + currency;

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const avgExpense = expenses.length ? Math.round(totalExpense / expenses.length) : 0;
  const maxExpense = expenses.length ? Math.max(...expenses.map(t => t.amount)) : 0;
  const minExpense = expenses.length ? Math.min(...expenses.map(t => t.amount)) : 0;

  // Median
  const sorted = [...expenses].sort((a, b) => a.amount - b.amount);
  const median = sorted.length
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1].amount + sorted[sorted.length / 2].amount) / 2
      : sorted[Math.floor(sorted.length / 2)].amount
    : 0;

  // ── Expense category doughnut ─────────────────────────────────────────────
  const catTotals = CATEGORIES.map(c =>
    expenses.filter(t => t.category === c).reduce((s, t) => s + t.amount, 0)
  );
  const nonZeroExp = CATEGORIES
    .map((c, i) => ({ c, v: catTotals[i] }))
    .filter(x => x.v > 0);

  const expDoughnut = {
    labels: nonZeroExp.map(x => x.c),
    datasets: [{
      data: nonZeroExp.map(x => x.v),
      backgroundColor: COLORS.slice(0, nonZeroExp.length),
      borderWidth: 0,
    }],
  };

  // ── Income sources doughnut ───────────────────────────────────────────────
  const incCatTotals = CATEGORIES.map(c =>
    incomes.filter(t => t.category === c).reduce((s, t) => s + t.amount, 0)
  );
  const nonZeroInc = CATEGORIES
    .map((c, i) => ({ c, v: incCatTotals[i] }))
    .filter(x => x.v > 0);

  const incDoughnut = {
    labels: nonZeroInc.map(x => x.c),
    datasets: [{
      data: nonZeroInc.map(x => x.v),
      backgroundColor: ['#7fff7f', '#a3ffb0', '#56e87a', '#38d97a', '#20bf6b', '#0fa85d', '#059b50', '#048a44'].slice(0, nonZeroInc.length),
      borderWidth: 0,
    }],
  };

  // ── Monthly bar ───────────────────────────────────────────────────────────
  const months = {};
  transactions.forEach(t => {
    const m = t.date?.substring(0, 7) ?? '?';
    if (!months[m]) months[m] = { income: 0, expense: 0 };
    months[m][t.type] += t.amount;
  });
  const sortedMonths = Object.keys(months).sort();

  const monthlyBar = {
    labels: sortedMonths,
    datasets: [
      { label: 'Доходы', data: sortedMonths.map(m => months[m].income), backgroundColor: 'rgba(127,255,127,0.7)', borderRadius: 6 },
      { label: 'Расходы', data: sortedMonths.map(m => months[m].expense), backgroundColor: 'rgba(255,154,216,0.7)', borderRadius: 6 },
    ],
  };

  // ── Balance over time ─────────────────────────────────────────────────────
  const sortedTx = [...transactions].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  let running = 0;
  const balByDate = {};
  sortedTx.forEach(t => {
    running += t.type === 'income' ? t.amount : -t.amount;
    balByDate[t.date] = running;
  });
  const balDates = Object.keys(balByDate).sort();
  const balanceLine = {
    labels: balDates,
    datasets: [{
      label: 'Баланс',
      data: balDates.map(d => balByDate[d]),
      borderColor: '#ff72c2',
      backgroundColor: 'rgba(255,114,194,0.12)',
      tension: 0.4,
      fill: true,
      pointRadius: balDates.length > 40 ? 0 : 3,
      pointHoverRadius: 5,
    }],
  };

  // ── Transaction size histogram ────────────────────────────────────────────
  const buckets = [500, 1000, 2000, 5000, 10000, 20000, 50000];
  const bucketLabels = ['<500', '500–1к', '1к–2к', '2к–5к', '5к–10к', '10к–20к', '20к–50к', '>50к'];
  const bucketCounts = new Array(buckets.length + 1).fill(0);
  expenses.forEach(t => {
    const idx = buckets.findIndex(b => t.amount < b);
    bucketCounts[idx === -1 ? buckets.length : idx]++;
  });
  const histData = {
    labels: bucketLabels,
    datasets: [{
      label: 'Транзакций',
      data: bucketCounts,
      backgroundColor: 'rgba(255,110,199,0.7)',
      borderRadius: 8,
    }],
  };

  const chartOpts = {
    plugins: { legend: { labels: { color: '#f5c0dc' } } },
    scales: { x: axis, y: axis },
  };

  return (
    <div>
      <h2 className="page-title">Статистика</h2>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <StatCard label="Всего доходов" value={fmt(totalIncome)} color="#7fff7f" />
        <StatCard label="Всего расходов" value={fmt(totalExpense)} color="#ff9ad8" />
        <StatCard label="Текущий баланс" value={fmt(totalIncome - totalExpense)} color={(totalIncome - totalExpense) >= 0 ? '#c77dff' : '#ff6b6b'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <StatCard label="Ср. расход" value={fmt(avgExpense)} color="#ffd1ee" />
        <StatCard label="Медиана расхода" value={fmt(median)} color="#ffd1ee" />
        <StatCard label="Макс. расход" value={fmt(maxExpense)} color="#ff9ad8" />
        <StatCard label="Мин. расход" value={fmt(minExpense)} color="#ffd1ee" />
      </div>

      {/* Balance over time */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Баланс во времени</h3>
        {balDates.length > 0
          ? <Line data={balanceLine} options={chartOpts} />
          : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>}
      </div>

      {/* Monthly income vs expense */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Доходы и расходы по месяцам</h3>
        {sortedMonths.length > 0
          ? <Bar data={monthlyBar} options={chartOpts} />
          : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>}
      </div>

      {/* Two doughnuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Структура расходов</h3>
          {nonZeroExp.length > 0
            ? <Doughnut data={expDoughnut} options={{ plugins: { legend: { labels: { color: '#f5c0dc' } } } }} />
            : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет расходов</p>}
        </div>
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Источники доходов</h3>
          {nonZeroInc.length > 0
            ? <Doughnut data={incDoughnut} options={{ plugins: { legend: { labels: { color: '#f5c0dc' } } } }} />
            : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет доходов</p>}
        </div>
      </div>

      {/* Transaction size histogram */}
      <div style={card}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Размер расходов (гистограмма)</h3>
        {expenses.length > 0
          ? (
            <Bar data={histData} options={{
              plugins: { legend: { display: false } },
              scales: {
                x: axis,
                y: { ...axis, ticks: { ...axis.ticks, stepSize: 1 } },
              },
            }} />
          )
          : <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>}
      </div>
    </div>
  );
}
