import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Silakan masukkan username dan password Anda.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDemoFill = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else {
      setUsername('kepalasekolah');
      setPassword('password123');
    }
    setErrorMessage('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <span className="login-school-tag">Sekolah Dasar Negeri</span>
          <h1 className="login-title">SPK PEMILIHAN GURU BERPRESTASI</h1>
          <p className="login-subtitle">
            Implementasi Metode Weighted Product (WP) Terpadu
          </p>
        </div>

        <div className="login-body">
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label form-label-required" htmlFor="username">
                Nama Pengguna (Username)
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Contoh: admin atau kepalasekolah"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label form-label-required" htmlFor="password">
                Kata Sandi (Password)
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Masukkan kata sandi akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', textAlign: 'center' }}>
              Uji Coba Akun Demo Cepat:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDemoFill('admin')}
              >
                Akun Admin TU
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDemoFill('kepala')}
              >
                Akun Kepala Sekolah
              </button>
            </div>
          </div>
        </div>

        <div className="login-footer">
          &copy; 2026 SDN 01 Harapan Bangsa &bull; Sistem Pendukung Keputusan WP
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
