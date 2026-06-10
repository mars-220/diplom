import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('rf_users')) || []; } catch { return []; }
  };
  const saveUsers = (users) => localStorage.setItem('rf_users', JSON.stringify(users));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    if (mode === 'register') {
      if (users.find(u => u.email === email)) {
        setError('Email уже зарегистрирован');
        return;
      }
      const user = { id: Date.now(), name, email, password };
      saveUsers([...users, user]);
      onLogin({ id: user.id, name: user.name, email: user.email });
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { setError('Неверный email или пароль'); return; }
      onLogin({ id: user.id, name: user.name, email: user.email });
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{mode === 'login' ? 'Войти' : 'Регистрация'}</h2>
        {mode === 'register' && (
          <div className="form-group">
            <label>Имя</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Пароль"
            required
          />
        </div>
        <label className="password-toggle">
          <input
            type="checkbox"
            checked={showPass}
            onChange={e => setShowPass(e.target.checked)}
          />
          Показать пароль
        </label>
        {error && <p style={{ color: '#ff6b6b', margin: '0 0 12px' }}>{error}</p>}
        <button type="submit" className="btn-primary">
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <p>
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </form>
    </div>
  );
}
