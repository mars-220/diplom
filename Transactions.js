import { useState, useMemo } from 'react';
import { CATEGORIES, CAT_ICONS } from '../constants';

const PAGE_SIZE = 15;

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

export default function Transactions({ transactions, addTransaction, deleteTransaction, currency, addToast }) {
  // ── Add-form state ────────────────────────────────────────────
  const [type,        setType]        = useState('expense');
  const [amount,      setAmount]      = useState('');
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState(() => new Date().toISOString().split('T')[0]);

  // ── Filter / search / sort / page ─────────────────────────────
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat,  setFilterCat]  = useState('all');
  const [sortKey,    setSortKey]    = useState('date');
  const [sortAsc,    setSortAsc]    = useState(false);
  const [curPage,    setCurPage]    = useState(1);

  // ── Selection ─────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
    setCurPage(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || +amount <= 0) return;
    addTransaction({ type, amount: +amount, category, description, date });
    addToast(`${CAT_ICONS[category]} Добавлено: ${Number(amount).toLocaleString('ru-RU')} ${currency} · ${category}`,
      type === 'income' ? 'success' : 'expense');
    setAmount(''); setDescription('');
    setCurPage(1);
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    addToast('Транзакция удалена', 'info');
  };

  const handleDeleteSelected = () => {
    selected.forEach(id => deleteTransaction(id));
    addToast(`Удалено транзакций: ${selected.size}`, 'info');
    setSelected(new Set());
  };

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  // ── Filtered & sorted list ────────────────────────────────────
  const filtered = useMemo(() => {
    let list = transactions;
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterCat  !== 'all') list = list.filter(t => t.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.category.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'amount') { va = +va; vb = +vb; }
      if (sortKey === 'date')   { va = va ?? ''; vb = vb ?? ''; }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
  }, [transactions, filterType, filterCat, search, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(curPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totInc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const SortIcon = ({ k }) => sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : ' ·';

  const thStyle = { padding: '10px 14px', color: '#f5c0dc', fontWeight: 600, textAlign: 'left', fontSize: '0.82rem', whiteSpace: 'nowrap' };
  const tdStyle = { padding: '10px 14px', fontSize: '0.88rem', borderBottom: '1px solid rgba(255,182,193,0.06)' };

  return (
    <div>
      <h2 className="page-title">Транзакции</h2>

      {/* ── Add form ──────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={card({ marginBottom: 20 })}>
        <h3 style={{ margin: '0 0 16px', color: '#ffd1ee' }}>Добавить транзакцию</h3>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['expense', '− Расход'], ['income', '+ Доход']].map(([t, label]) => (
            <button key={t} type="button" onClick={() => setType(t)} style={{
              flex: 1, padding: '9px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.88rem', transition: 'background 0.15s',
              background: type === t ? (t === 'income' ? 'rgba(127,255,127,0.8)' : 'rgba(255,110,199,0.8)') : 'rgba(255,255,255,0.07)',
              color: type === t ? '#111' : '#f5c0dc',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input style={inp} placeholder={`Сумма, ${currency}`} type="number" min="0.01" step="0.01"
            value={amount} onChange={e => setAmount(e.target.value)} required />
          <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
          </select>
          <input style={inp} type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Описание (необязательно)"
            value={description} onChange={e => setDescription(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 28px', flexShrink: 0 }}>
            Добавить
          </button>
        </div>
      </form>

      {/* ── Filters + search ──────────────────────────────────── */}
      <div style={card({ marginBottom: 16, padding: '16px 22px' })}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: '1 1 200px' }}>
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Поиск по категории, описанию, сумме…"
              value={search} onChange={e => { setSearch(e.target.value); setCurPage(1); }} />
          </div>
          <select style={{ ...inp, width: 'auto' }} value={filterType} onChange={e => { setFilterType(e.target.value); setCurPage(1); }}>
            <option value="all">Все типы</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
          <select style={{ ...inp, width: 'auto' }} value={filterCat} onChange={e => { setFilterCat(e.target.value); setCurPage(1); }}>
            <option value="all">Все категории</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
          </select>
          {selected.size > 0 && (
            <button onClick={handleDeleteSelected} style={{
              padding: '9px 16px', border: '1px solid #ff6b6b', borderRadius: 12,
              background: 'rgba(255,70,70,0.12)', color: '#ff9090', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}>
              🗑 Удалить {selected.size}
            </button>
          )}
        </div>
        {/* Summary row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: '0.82rem' }}>
          <span style={{ color: '#aaa' }}>Найдено: <b style={{ color: '#ffd1ee' }}>{filtered.length}</b></span>
          <span style={{ color: '#aaa' }}>Доходы: <b style={{ color: '#7fff7f' }}>{totInc.toLocaleString('ru-RU')} {currency}</b></span>
          <span style={{ color: '#aaa' }}>Расходы: <b style={{ color: '#ff9ad8' }}>{totExp.toLocaleString('ru-RU')} {currency}</b></span>
          <span style={{ color: '#aaa' }}>Баланс: <b style={{ color: (totInc - totExp) >= 0 ? '#c77dff' : '#ff6b6b' }}>{(totInc - totExp).toLocaleString('ru-RU')} {currency}</b></span>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div style={card({ padding: 0, overflow: 'hidden' })}>
        {paginated.length === 0
          ? <p style={{ color: '#f5c0dc', padding: '24px', margin: 0 }}>Ничего не найдено</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,182,193,0.12)' }}>
                    <th style={{ ...thStyle, width: 36, padding: '10px 8px 10px 16px' }}>
                      <input type="checkbox"
                        checked={paginated.length > 0 && paginated.every(t => selected.has(t.id))}
                        onChange={e => {
                          const ids = paginated.map(t => t.id);
                          setSelected(s => {
                            const n = new Set(s);
                            e.target.checked ? ids.forEach(id => n.add(id)) : ids.forEach(id => n.delete(id));
                            return n;
                          });
                        }}
                        style={{ accentColor: '#ff6ec7', cursor: 'pointer' }}
                      />
                    </th>
                    {[['date', 'Дата'], ['category', 'Категория'], ['type', 'Тип'], ['amount', 'Сумма']].map(([k, label]) => (
                      <th key={k} className="th-sort" style={thStyle} onClick={() => handleSort(k)}>
                        {label}<SortIcon k={k} />
                      </th>
                    ))}
                    <th style={thStyle}>Описание</th>
                    <th style={{ ...thStyle, width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => (
                    <tr key={t.id} style={{
                      background: selected.has(t.id) ? 'rgba(255,110,199,0.07)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      transition: 'background 0.15s',
                    }}>
                      <td style={{ ...tdStyle, padding: '10px 8px 10px 16px' }}>
                        <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)}
                          style={{ accentColor: '#ff6ec7', cursor: 'pointer' }} />
                      </td>
                      <td style={{ ...tdStyle, color: '#aaa' }}>{t.date}</td>
                      <td style={{ ...tdStyle, color: '#ffd1ee' }}>
                        <span style={{ marginRight: 6 }}>{CAT_ICONS[t.category]}</span>{t.category}
                      </td>
                      <td style={{ ...tdStyle }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                          background: t.type === 'income' ? 'rgba(127,255,127,0.15)' : 'rgba(255,154,216,0.15)',
                          color: t.type === 'income' ? '#7fff7f' : '#ff9ad8',
                        }}>
                          {t.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: t.type === 'income' ? '#7fff7f' : '#ff9ad8' }}>
                        {t.type === 'income' ? '+' : '−'}{t.amount.toLocaleString('ru-RU')} {currency}
                      </td>
                      <td style={{ ...tdStyle, color: '#f5c0dc', fontSize: '0.82rem' }}>{t.description || '—'}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button onClick={() => handleDelete(t.id)}
                          style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1rem', opacity: 0.7, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.target.style.opacity = 1}
                          onMouseLeave={e => e.target.style.opacity = 0.7}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '14px 22px', borderTop: '1px solid rgba(255,182,193,0.08)' }}>
            <button onClick={() => setCurPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={paginBtn(page === 1)}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
              .reduce((acc, n, i, arr) => {
                if (i > 0 && n - arr[i - 1] > 1) acc.push('…');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) => typeof n === 'string'
                ? <span key={`e${i}`} style={{ color: '#aaa', padding: '0 4px' }}>…</span>
                : <button key={n} onClick={() => setCurPage(n)} style={paginBtn(false, n === page)}>{n}</button>
              )}
            <button onClick={() => setCurPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={paginBtn(page === totalPages)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}

const paginBtn = (disabled, active = false) => ({
  padding: '5px 11px', borderRadius: 8, border: 'none', cursor: disabled ? 'default' : 'pointer',
  background: active ? 'linear-gradient(135deg,#ff6ec7,#ff9dd7)' : 'rgba(255,255,255,0.07)',
  color: active ? '#fff' : disabled ? '#555' : '#f5c0dc',
  fontWeight: active ? 700 : 400, fontSize: '0.85rem',
});
