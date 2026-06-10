import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

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

export default function Savings({ transactions, currency }) {
  const fmt = (n) => Math.round(Number(n)).toLocaleString('ru-RU') + ' ' + currency;

  // Build per-month data
  const monthsMap = {};
  transactions.forEach(t => {
    const m = t.date?.substring(0, 7);
    if (!m) return;
    if (!monthsMap[m]) monthsMap[m] = { income: 0, expense: 0 };
    monthsMap[m][t.type] += t.amount;
  });

  const sortedMonths = Object.keys(monthsMap).sort();
  const monthlySavings = sortedMonths.map(m => monthsMap[m].income - monthsMap[m].expense);
  const savingsRates = sortedMonths.map(m => {
    const inc = monthsMap[m].income;
    return inc > 0 ? +((((inc - monthsMap[m].expense) / inc) * 100).toFixed(1)) : 0;
  });

  // Cumulative savings
  let cum = 0;
  const cumulativeData = monthlySavings.map(s => { cum += s; return cum; });

  const totalSaved = cumulativeData[cumulativeData.length - 1] ?? 0;
  const avgMonthly = sortedMonths.length > 0
    ? monthlySavings.reduce((s, v) => s + v, 0) / sortedMonths.length
    : 0;
  const positiveMonths = monthlySavings.filter(s => s > 0).length;
  const avgRate = savingsRates.length > 0
    ? (savingsRates.reduce((s, v) => s + v, 0) / savingsRates.length).toFixed(1)
    : 0;

  const bestIdx = monthlySavings.indexOf(Math.max(...monthlySavings));
  const worstIdx = monthlySavings.indexOf(Math.min(...monthlySavings));

  const proj6 = totalSaved + avgMonthly * 6;
  const proj12 = totalSaved + avgMonthly * 12;
  const proj24 = totalSaved + avgMonthly * 24;

  // Charts
  const cumulativeLine = {
    labels: sortedMonths,
    datasets: [{
      label: 'Накоплено',
      data: cumulativeData,
      borderColor: '#c77dff',
      backgroundColor: 'rgba(199,125,255,0.15)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const monthlyBar = {
    labels: sortedMonths,
    datasets: [{
      label: 'Сбережения',
      data: monthlySavings,
      backgroundColor: monthlySavings.map(v => v >= 0 ? 'rgba(127,255,127,0.7)' : 'rgba(255,107,107,0.7)'),
      borderRadius: 8,
    }],
  };

  const rateLine = {
    labels: sortedMonths,
    datasets: [{
      label: 'Норма сбережений, %',
      data: savingsRates,
      borderColor: '#ff9dd7',
      backgroundColor: 'rgba(255,157,215,0.12)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  // Projected savings line (extend existing + 12 future months)
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const futureLabels = [];
  const futureData = [];
  if (lastMonth) {
    let runningFuture = totalSaved;
    for (let i = 1; i <= 12; i++) {
      const d = new Date(lastMonth + '-01');
      d.setMonth(d.getMonth() + i);
      const label = d.toISOString().substring(0, 7);
      futureLabels.push(label);
      runningFuture += avgMonthly;
      futureData.push(runningFuture);
    }
  }

  const projectionLine = {
    labels: [...sortedMonths, ...futureLabels],
    datasets: [
      {
        label: 'Факт',
        data: [...cumulativeData, ...new Array(futureLabels.length).fill(null)],
        borderColor: '#c77dff',
        backgroundColor: 'rgba(199,125,255,0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Прогноз',
        data: [...new Array(sortedMonths.length - 1).fill(null), totalSaved, ...futureData],
        borderColor: '#ff9dd7',
        backgroundColor: 'rgba(255,157,215,0.08)',
        tension: 0.4,
        fill: true,
        borderDash: [6, 4],
        pointRadius: 2,
      },
    ],
  };

  const chartOpts = {
    plugins: { legend: { labels: { color: '#f5c0dc' } } },
    scales: { x: axis, y: axis },
  };

  const noData = sortedMonths.length === 0;

  return (
    <div>
      <h2 className="page-title">Накопления</h2>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Всего накоплено', v: fmt(totalSaved), c: totalSaved >= 0 ? '#7fff7f' : '#ff6b6b' },
          { label: 'Ср. сбережений / мес.', v: fmt(avgMonthly), c: '#c77dff' },
          { label: 'Ср. норма сбережений', v: `${avgRate}%`, c: '#ff9ad8' },
          { label: 'Прибыльных месяцев', v: `${positiveMonths} / ${sortedMonths.length}`, c: '#ffd1ee' },
        ].map(({ label, v, c }) => (
          <div key={label} style={{ ...card, textAlign: 'center' }}>
            <p style={{ margin: '0 0 5px', color: '#f5c0dc', fontSize: '0.82rem' }}>{label}</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem', color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Best/worst + projections */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 18px', color: '#ffd1ee' }}>Прогноз накоплений</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {[
            {
              label: 'Лучший месяц',
              v: noData ? '—' : fmt(monthlySavings[bestIdx]),
              sub: sortedMonths[bestIdx] ?? '',
              c: '#7fff7f',
            },
            {
              label: 'Худший месяц',
              v: noData ? '—' : fmt(monthlySavings[worstIdx]),
              sub: sortedMonths[worstIdx] ?? '',
              c: '#ff6b6b',
            },
            { label: 'Через 6 месяцев', v: noData ? '—' : fmt(proj6), sub: 'при текущем темпе', c: '#c77dff' },
            { label: 'Через 12 месяцев', v: noData ? '—' : fmt(proj12), sub: 'при текущем темпе', c: '#ff9ad8' },
            { label: 'Через 24 месяца', v: noData ? '—' : fmt(proj24), sub: 'при текущем темпе', c: '#ffd1ee' },
          ].map(({ label, v, sub, c }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 5px', color: '#aaa', fontSize: '0.8rem' }}>{label}</p>
              <p style={{ margin: '0 0 3px', color: c, fontWeight: 700, fontSize: '1.05rem' }}>{v}</p>
              <p style={{ margin: 0, color: '#666', fontSize: '0.75rem' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projection chart */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Факт и прогноз накоплений</h3>
        {noData
          ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>
          : <Line data={projectionLine} options={chartOpts} />}
      </div>

      {/* Cumulative savings */}
      <div style={{ ...card, marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Накопленная сумма по месяцам</h3>
        {noData
          ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>
          : <Line data={cumulativeLine} options={chartOpts} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Monthly savings bar */}
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Сбережения по месяцам</h3>
          {noData
            ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>
            : (
              <Bar data={monthlyBar} options={{
                plugins: { legend: { display: false } },
                scales: { x: axis, y: axis },
              }} />
            )}
        </div>

        {/* Savings rate line */}
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Норма сбережений, %</h3>
          {noData
            ? <p style={{ color: '#f5c0dc', margin: 0 }}>Нет данных</p>
            : <Line data={rateLine} options={chartOpts} />}
        </div>
      </div>

      {/* Monthly table */}
      {!noData && (
        <div style={{ ...card, marginTop: 18 }}>
          <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Детализация по месяцам</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ color: '#f5c0dc', borderBottom: '1px solid rgba(255,182,193,0.15)' }}>
                  {['Месяц', 'Доходы', 'Расходы', 'Сохранено', 'Норма', 'Итого'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMonths.map((m, i) => {
                  const inc = monthsMap[m].income;
                  const exp = monthsMap[m].expense;
                  const sav = inc - exp;
                  const rate = inc > 0 ? (sav / inc * 100).toFixed(1) : '—';
                  return (
                    <tr
                      key={m}
                      style={{
                        borderBottom: '1px solid rgba(255,182,193,0.07)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: '#ffd1ee', textAlign: 'right' }}>{m}</td>
                      <td style={{ padding: '8px 12px', color: '#7fff7f', textAlign: 'right' }}>{inc.toLocaleString('ru-RU')}</td>
                      <td style={{ padding: '8px 12px', color: '#ff9ad8', textAlign: 'right' }}>{exp.toLocaleString('ru-RU')}</td>
                      <td style={{ padding: '8px 12px', color: sav >= 0 ? '#7fff7f' : '#ff6b6b', textAlign: 'right', fontWeight: 600 }}>
                        {sav.toLocaleString('ru-RU')}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#f5c0dc', textAlign: 'right' }}>
                        {rate !== '—' ? `${rate}%` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', color: cumulativeData[i] >= 0 ? '#c77dff' : '#ff6b6b', textAlign: 'right', fontWeight: 700 }}>
                        {cumulativeData[i].toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
