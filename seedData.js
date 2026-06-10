// ─────────────────────────────────────────────────────────────────────────────
// Демонстрационные данные — 7 месяцев реальных транзакций (окт 2025 – апр 2026)
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_TRANSACTIONS = [
  // ── Октябрь 2025 ─────────────────────────────────────────────
  { id: 10001, date: '2025-10-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за октябрь' },
  { id: 10002, date: '2025-10-03', type: 'expense', amount: 4200,   category: 'Продукты',    description: 'Магнит, недельная закупка' },
  { id: 10003, date: '2025-10-05', type: 'expense', amount: 2100,   category: 'Транспорт',   description: 'Проездной на месяц' },
  { id: 10004, date: '2025-10-07', type: 'expense', amount: 5400,   category: 'Коммуналка',  description: 'ЖКХ октябрь' },
  { id: 10005, date: '2025-10-09', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10006, date: '2025-10-12', type: 'expense', amount: 3800,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10007, date: '2025-10-14', type: 'expense', amount: 1800,   category: 'Развлечения', description: 'Кино' },
  { id: 10008, date: '2025-10-17', type: 'expense', amount: 4500,   category: 'Продукты',    description: 'Пятёрочка + фермерский рынок' },
  { id: 10009, date: '2025-10-20', type: 'expense', amount: 3200,   category: 'Здоровье',    description: 'Аптека, витамины' },
  { id: 10010, date: '2025-10-23', type: 'expense', amount: 3600,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10011, date: '2025-10-25', type: 'expense', amount: 5000,   category: 'Образование', description: 'Курс по UX-дизайну (1/2)' },
  { id: 10012, date: '2025-10-28', type: 'expense', amount: 2400,   category: 'Развлечения', description: 'Ресторан с друзьями' },

  // ── Ноябрь 2025 ──────────────────────────────────────────────
  { id: 10013, date: '2025-11-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за ноябрь' },
  { id: 10014, date: '2025-11-01', type: 'income',  amount: 20000,  category: 'Инвестиции',  description: 'Фриланс: дизайн лендинга' },
  { id: 10015, date: '2025-11-03', type: 'expense', amount: 4800,   category: 'Продукты',    description: 'Магнит + Яндекс.Лавка' },
  { id: 10016, date: '2025-11-05', type: 'expense', amount: 1500,   category: 'Транспорт',   description: 'Такси' },
  { id: 10017, date: '2025-11-07', type: 'expense', amount: 5200,   category: 'Коммуналка',  description: 'ЖКХ ноябрь' },
  { id: 10018, date: '2025-11-09', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10019, date: '2025-11-12', type: 'expense', amount: 3500,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10020, date: '2025-11-14', type: 'expense', amount: 1800,   category: 'Здоровье',    description: 'Витамины C и D' },
  { id: 10021, date: '2025-11-16', type: 'expense', amount: 8000,   category: 'Подарки',     description: 'День рождения подруги' },
  { id: 10022, date: '2025-11-19', type: 'expense', amount: 4200,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10023, date: '2025-11-22', type: 'expense', amount: 3200,   category: 'Развлечения', description: 'Концерт' },
  { id: 10024, date: '2025-11-25', type: 'expense', amount: 2100,   category: 'Прочее',      description: 'Разные мелочи' },
  { id: 10025, date: '2025-11-27', type: 'expense', amount: 3900,   category: 'Продукты',    description: 'Продукты к праздникам' },
  { id: 10026, date: '2025-11-30', type: 'expense', amount: 1800,   category: 'Транспорт',   description: 'Яндекс.Go' },

  // ── Декабрь 2025 ─────────────────────────────────────────────
  { id: 10027, date: '2025-12-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за декабрь' },
  { id: 10028, date: '2025-12-15', type: 'income',  amount: 25000,  category: 'Зарплата',    description: 'Новогодняя премия' },
  { id: 10029, date: '2025-12-01', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10030, date: '2025-12-04', type: 'expense', amount: 5100,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10031, date: '2025-12-06', type: 'expense', amount: 5800,   category: 'Коммуналка',  description: 'ЖКХ декабрь' },
  { id: 10032, date: '2025-12-08', type: 'expense', amount: 2300,   category: 'Транспорт',   description: 'Проездной' },
  { id: 10033, date: '2025-12-10', type: 'expense', amount: 4500,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10034, date: '2025-12-12', type: 'expense', amount: 15000,  category: 'Подарки',     description: 'Новогодние подарки' },
  { id: 10035, date: '2025-12-14', type: 'expense', amount: 2800,   category: 'Развлечения', description: 'Корпоратив' },
  { id: 10036, date: '2025-12-16', type: 'expense', amount: 3800,   category: 'Продукты',    description: 'Магнит' },
  { id: 10037, date: '2025-12-18', type: 'expense', amount: 4200,   category: 'Здоровье',    description: 'Стоматолог, осмотр' },
  { id: 10038, date: '2025-12-22', type: 'expense', amount: 4800,   category: 'Продукты',    description: 'Праздничные продукты' },
  { id: 10039, date: '2025-12-24', type: 'expense', amount: 8500,   category: 'Путешествия', description: 'Поездка к родственникам' },
  { id: 10040, date: '2025-12-27', type: 'expense', amount: 3100,   category: 'Развлечения', description: 'Новогодние мероприятия' },
  { id: 10041, date: '2025-12-30', type: 'expense', amount: 4600,   category: 'Прочее',      description: 'Разные покупки' },

  // ── Январь 2026 ──────────────────────────────────────────────
  { id: 10042, date: '2026-01-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за январь' },
  { id: 10043, date: '2026-01-05', type: 'expense', amount: 5200,   category: 'Продукты',    description: 'Пятёрочка после праздников' },
  { id: 10044, date: '2026-01-07', type: 'expense', amount: 5900,   category: 'Коммуналка',  description: 'ЖКХ январь (холодно)' },
  { id: 10045, date: '2026-01-09', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10046, date: '2026-01-10', type: 'expense', amount: 2500,   category: 'Транспорт',   description: 'Проездной + такси' },
  { id: 10047, date: '2026-01-12', type: 'expense', amount: 4100,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10048, date: '2026-01-14', type: 'expense', amount: 8000,   category: 'Образование', description: 'Курс Python для аналитиков' },
  { id: 10049, date: '2026-01-16', type: 'expense', amount: 3900,   category: 'Продукты',    description: 'Магнит' },
  { id: 10050, date: '2026-01-18', type: 'expense', amount: 2200,   category: 'Здоровье',    description: 'Зубной, лечение' },
  { id: 10051, date: '2026-01-21', type: 'expense', amount: 1900,   category: 'Развлечения', description: 'Кино и кафе' },
  { id: 10052, date: '2026-01-24', type: 'expense', amount: 4300,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10053, date: '2026-01-26', type: 'income',  amount: 18000,  category: 'Инвестиции',  description: 'Фриланс: UI-kit' },
  { id: 10054, date: '2026-01-28', type: 'expense', amount: 3800,   category: 'Прочее',      description: 'Хозтовары' },

  // ── Февраль 2026 ─────────────────────────────────────────────
  { id: 10055, date: '2026-02-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за февраль' },
  { id: 10056, date: '2026-02-03', type: 'expense', amount: 4600,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10057, date: '2026-02-05', type: 'expense', amount: 5100,   category: 'Коммуналка',  description: 'ЖКХ февраль' },
  { id: 10058, date: '2026-02-07', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10059, date: '2026-02-09', type: 'expense', amount: 1800,   category: 'Транспорт',   description: 'Яндекс.Go' },
  { id: 10060, date: '2026-02-12', type: 'expense', amount: 4200,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10061, date: '2026-02-14', type: 'expense', amount: 5500,   category: 'Подарки',     description: 'День святого Валентина' },
  { id: 10062, date: '2026-02-16', type: 'expense', amount: 3800,   category: 'Развлечения', description: 'Ресторан' },
  { id: 10063, date: '2026-02-19', type: 'expense', amount: 3900,   category: 'Продукты',    description: 'Магнит' },
  { id: 10064, date: '2026-02-21', type: 'expense', amount: 35000,  category: 'Путешествия', description: 'Поездка в Санкт-Петербург' },
  { id: 10065, date: '2026-02-24', type: 'expense', amount: 3500,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10066, date: '2026-02-27', type: 'expense', amount: 2900,   category: 'Здоровье',    description: 'Аптека' },

  // ── Март 2026 ────────────────────────────────────────────────
  { id: 10067, date: '2026-03-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за март' },
  { id: 10068, date: '2026-03-01', type: 'income',  amount: 23000,  category: 'Инвестиции',  description: 'Фриланс: мобильное приложение' },
  { id: 10069, date: '2026-03-03', type: 'expense', amount: 4800,   category: 'Продукты',    description: 'Магнит' },
  { id: 10070, date: '2026-03-05', type: 'expense', amount: 5200,   category: 'Коммуналка',  description: 'ЖКХ март' },
  { id: 10071, date: '2026-03-07', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10072, date: '2026-03-08', type: 'expense', amount: 7500,   category: 'Подарки',     description: 'Подарки на 8 марта' },
  { id: 10073, date: '2026-03-10', type: 'expense', amount: 2200,   category: 'Транспорт',   description: 'Проездной' },
  { id: 10074, date: '2026-03-12', type: 'expense', amount: 4100,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10075, date: '2026-03-15', type: 'expense', amount: 3600,   category: 'Здоровье',    description: 'Косметика и витамины' },
  { id: 10076, date: '2026-03-17', type: 'expense', amount: 4400,   category: 'Продукты',    description: 'Пятёрочка' },
  { id: 10077, date: '2026-03-20', type: 'expense', amount: 3200,   category: 'Развлечения', description: 'Театр' },
  { id: 10078, date: '2026-03-23', type: 'expense', amount: 4900,   category: 'Продукты',    description: 'Магнит' },
  { id: 10079, date: '2026-03-26', type: 'expense', amount: 4000,   category: 'Образование', description: 'Онлайн-курс по Figma' },
  { id: 10080, date: '2026-03-30', type: 'expense', amount: 2800,   category: 'Прочее',      description: 'Книги' },

  // ── Апрель 2026 (по 14-е) ────────────────────────────────────
  { id: 10081, date: '2026-04-01', type: 'income',  amount: 87500,  category: 'Зарплата',    description: 'Зарплата за апрель' },
  { id: 10082, date: '2026-04-02', type: 'expense', amount: 4500,   category: 'Продукты',    description: 'Магнит' },
  { id: 10083, date: '2026-04-04', type: 'expense', amount: 5500,   category: 'Коммуналка',  description: 'ЖКХ апрель' },
  { id: 10084, date: '2026-04-06', type: 'expense', amount: 2100,   category: 'Подписки',    description: 'Netflix, Spotify, iCloud' },
  { id: 10085, date: '2026-04-08', type: 'expense', amount: 1800,   category: 'Транспорт',   description: 'Яндекс.Go' },
  { id: 10086, date: '2026-04-09', type: 'expense', amount: 4200,   category: 'Продукты',    description: 'ВкусВилл' },
  { id: 10087, date: '2026-04-11', type: 'expense', amount: 2800,   category: 'Здоровье',    description: 'Аптека, весенний авитаминоз' },
  { id: 10088, date: '2026-04-12', type: 'expense', amount: 2200,   category: 'Развлечения', description: 'Кафе с подругами' },
  { id: 10089, date: '2026-04-14', type: 'expense', amount: 3800,   category: 'Продукты',    description: 'Пятёрочка' },
];

export const SEED_GOALS = [
  {
    id: 20001,
    name: 'Путешествие в Японию 🇯🇵',
    target: 150000,
    current: 45000,
    deadline: '2026-12-31',
  },
  {
    id: 20002,
    name: 'Новый MacBook Pro',
    target: 185000,
    current: 74000,
    deadline: '2026-09-01',
  },
  {
    id: 20003,
    name: 'Резервный фонд',
    target: 300000,
    current: 127500,
    deadline: null,
  },
  {
    id: 20004,
    name: 'Курс по UX-дизайну ✅',
    target: 35000,
    current: 35000,
    deadline: null,
  },
];

export const SEED_BUDGETS = {
  'Продукты':    22000,
  'Транспорт':   5000,
  'Развлечения': 8000,
  'Коммуналка':  7000,
  'Здоровье':    6000,
  'Подписки':    3000,
  'Подарки':     10000,
};
