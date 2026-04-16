import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';
import apiClient from '../../services/apiClient';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const Login = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        username: form.username,
        password: form.password,
      });
      const data = res.data || {};
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || {}));
      navigate('/');
    } catch (err) {
      const statusMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Login failed';
      setError(statusMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(5,150,105,0.12),transparent_28%)]" />
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/logo.png"
            alt="ITSM Hub logo"
            className="h-12 w-12 rounded-xl object-contain bg-background border border-border p-1"
          />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">ITSM Hub</h1>
            <p className="text-xs text-muted-foreground">IT Service Management</p>
          </div>
        </div>

        <h2 className="text-lg font-medium text-foreground mb-6">{t('signInToAccount', 'Sign in to your account')}</h2>

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('username', 'Username')}</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
              className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('enterUsername', 'Enter your username')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('password', 'Password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full h-10 px-3 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('enterPassword', 'Enter your password')}
              required
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? t('signingIn', 'Signing in...') : t('signIn', 'Sign In')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
