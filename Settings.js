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
const dangerBtn = {
  padding: '10px 22px', border: '1px solid rgba(255,107,107,0.5)', borderRadius: 16,
  background: 'rgba(255,70,70,0.08)', color: '#ff9090', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.15s', width: 'auto',
};

function Section({ title, children }) {
  return (
    <div className="card-lift" style={card({ marginBottom: 16 })}>
      <h3 style={{ margin: '0 0 18px', color: '#ffd1ee', fontSize: '1rem' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Settings({ settings, setSettings, transactions, goals, budgets, addToast, resetToDemo }) {
  const [newName, setNewName] = useState('');
  const user = (() => { try { return JSON.parse(localStorage.getItem('rf_user')) || {}; } catch { return {}; } })();

  // ── Currency ──────────────────────────────────────────────────
  const setCurrency = (c) => {
    setSettings(s => ({ ...s, currency: c }));
    addToast(`Валюта изменена на ${c}`, 'success');
  };

  // ── Name change ───────────────────────────────────────────────
  const handleNameChange = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const updated = { ...user, name: newName.trim() };
    localStorage.setItem('rf_user', JSON.stringify(updated));
    addToast(`Имя изменено на «${newName.trim()}»`, 'success');
    setNewName('');
    window.location.reload();
  };

  // ── Export JSON ───────────────────────────────────────────────
  const exportJSON = () => {
    const data = { transactions, goals, budgets, settings, exportedAt: new Date().toISOString() };
    download(JSON.stringify(data, null, 2), 'finance-backup.json', 'application/json');
    addToast('Данные экспортированы в JSON', 'success');
  };

  // ── Export CSV ────────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'Дата,Тип,Категория,Сумма,Описание';
    const rows = transactions.map(t =>
      [t.date, t.type === 'income' ? 'Доход' : 'Расход', t.category, t.amount, t.description || ''].join(',')
    );
    download([header, ...rows].join('\n'), 'transactions.csv', 'text/csv;charset=utf-8;');
    addToast(`Экспортировано ${transactions.length} транзакций в CSV`, 'success');
  };

  // ── Import JSON ───────────────────────────────────────────────
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.transactions) localStorage.setItem('rf_transactions', JSON.stringify(data.transactions));
        if (data.goals)        localStorage.setItem('rf_goals',        JSON.stringify(data.goals));
        if (data.budgets)      localStorage.setItem('rf_budgets',      JSON.stringify(data.budgets));
        if (data.settings)     localStorage.setItem('rf_settings',     JSON.stringify(data.settings));
        addToast('Данные импортированы — страница перезагружается…', 'success');
        setTimeout(() => window.location.reload(), 800);
      } catch {
        addToast('Ошибка импорта: неверный формат файла', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Clear data ────────────────────────────────────────────────
  const clearAll = () => {
    if (!window.confirm('Удалить все транзакции, цели и бюджеты? Это действие нельзя отменить.')) return;
    ['rf_transactions', 'rf_goals', 'rf_budgets'].forEach(k => localStorage.removeItem(k));
    addToast('Все данные удалены', 'info');
    setTimeout(() => window.location.reload(), 600);
  };

  const clearTransactions = () => {
    if (!window.confirm('Удалить все транзакции?')) return;
    localStorage.removeItem('rf_transactions');
    addToast('Транзакции удалены', 'info');
    setTimeout(() => window.location.reload(), 600);
  };

  // ── Stats summary ─────────────────────────────────────────────
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const fmt = (n) => n.toLocaleString('ru-RU') + ' ' + settings.currency;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 className="page-title">Настройки</h2>

      {/* ── Profile ───────────────────────────────────────────── */}
      <Section title="👤 Профиль">
        <p style={{ margin: '0 0 14px', color: '#f5c0dc', fontSize: '0.88rem' }}>
          Текущее имя: <strong style={{ color: '#ffd1ee' }}>{user.name}</strong>
          <span style={{ color: '#aaa', marginLeft: 8 }}>{user.email}</span>
        </p>
        <form onSubmit={handleNameChange} style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Новое имя"
            value={newName} onChange={e => setNewName(e.target.value)} required />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px', flexShrink: 0 }}>
            Изменить
          </button>
        </form>
      </Section>

      {/* ── Currency ──────────────────────────────────────────── */}
      <Section title="💱 Валюта отображения">
        <div style={{ display: 'flex', gap: 10 }}>
          {[['₽', 'Рубль'], ['$', 'Доллар'], ['€', 'Евро'], ['¥', 'Иена'], ['₸', 'Тенге']].map(([c, label]) => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              padding: '10px 18px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: settings.currency === c
                ? 'linear-gradient(135deg,#ff6ec7,#ff9dd7)'
                : 'rgba(255,255,255,0.07)',
              color: settings.currency === c ? '#fff' : '#f5c0dc',
              fontWeight: settings.currency === c ? 700 : 400,
              fontSize: '1rem', transition: 'background 0.15s',
            }}>
              {c} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Stats overview ────────────────────────────────────── */}
      <Section title="📊 Сводка данных">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Транзакций',  val: transactions.length,         color: '#ffd1ee' },
            { label: 'Доходы',      val: fmt(totalInc),               color: '#7fff7f' },
            { label: 'Расходы',     val: fmt(totalExp),               color: '#ff9ad8' },
            { label: 'Целей',       val: goals.length,                color: '#c77dff' },
            { label: 'Бюджетов',    val: Object.keys(budgets).length, color: '#ffd1ee' },
            { label: 'Баланс',      val: fmt(totalInc - totalExp),    color: (totalInc - totalExp) >= 0 ? '#7fff7f' : '#ff6b6b' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 3px', color: '#aaa', fontSize: '0.76rem' }}>{label}</p>
              <p style={{ margin: 0, fontWeight: 700, color, fontSize: '0.95rem' }}>{val}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Export / Import ───────────────────────────────────── */}
      <Section title="📁 Экспорт и импорт">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={exportJSON} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
            ⬇️ Экспорт JSON
          </button>
          <button onClick={exportCSV} className="btn-primary" style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg,#9d4edd,#c77dff)' }}>
            ⬇️ Экспорт CSV
          </button>
          <label style={{ cursor: 'pointer' }}>
            <span className="btn-primary" style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 18,
              background: 'linear-gradient(135deg,#3a86ff,#6da4ff)', color: '#fff', fontWeight: 700, fontSize: '1rem',
            }}>
              ⬆️ Импорт JSON
            </span>
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>
        <p style={{ margin: '12px 0 0', color: '#aaa', fontSize: '0.78rem' }}>
          JSON — полный бэкап (транзакции, цели, бюджеты, настройки). CSV — только транзакции для Excel.
        </p>
      </Section>

      {/* ── Demo data ─────────────────────────────────────────── */}
      <Section title="🎲 Демонстрационные данные">
        <p style={{ margin: '0 0 12px', color: '#f5c0dc', fontSize: '0.85rem' }}>
          Загружает 89 тестовых транзакций за 7 месяцев, 4 цели накопления и бюджетные лимиты.
          Текущие данные будут заменены.
        </p>
        <button
          onClick={() => {
            if (!window.confirm('Заменить все данные демонстрационными? Текущие данные будут потеряны.')) return;
            resetToDemo();
            addToast('Демо-данные загружены — 89 транзакций, 4 цели, 7 бюджетов', 'success');
            setTimeout(() => window.location.reload(), 600);
          }}
          className="btn-primary"
          style={{ width: 'auto', padding: '10px 22px', background: 'linear-gradient(135deg,#9d4edd,#c77dff)' }}
        >
          Загрузить демо-данные
        </button>
      </Section>

      {/* ── Danger zone ───────────────────────────────────────── */}
      <Section title="🗑 Удаление данных">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={clearTransactions} style={dangerBtn}>
            Удалить транзакции
          </button>
          <button onClick={clearAll} style={{ ...dangerBtn, borderColor: 'rgba(255,50,50,0.7)', background: 'rgba(255,50,50,0.12)', color: '#ff7070' }}>
            Удалить все данные
          </button>
        </div>
        <p style={{ margin: '12px 0 0', color: '#aaa', fontSize: '0.78rem' }}>
          Аккаунт не удаляется. Данные нельзя восстановить без бэкапа.
        </p>
      </Section>

      {/* ── About ────────────────────────────────────────────── */}
      <div style={{ ...card({ textAlign: 'center', padding: '18px' }), opacity: 0.6 }}>
        <p style={{ margin: 0, color: '#f5c0dc', fontSize: '0.8rem' }}>
          React Finance · v1.0 · Дипломная работа
        </p>
      </div>
    </div>
  );
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
