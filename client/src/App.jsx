import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KriteriaPage from './pages/KriteriaPage';
import AlternatifPage from './pages/AlternatifPage';
import PenilaianPage from './pages/PenilaianPage';
import PerhitunganWPPage from './pages/PerhitunganWPPage';
import LaporanPage from './pages/LaporanPage';

import './styles/App.css';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
        <p style={{ color: 'var(--color-text-muted)', fontWeight: '600' }}>Memuat sesi aplikasi...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/kriteria" element={<KriteriaPage />} />
          <Route path="/alternatif" element={<AlternatifPage />} />
          <Route path="/penilaian" element={<PenilaianPage />} />
          <Route path="/perhitungan" element={<PerhitunganWPPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
