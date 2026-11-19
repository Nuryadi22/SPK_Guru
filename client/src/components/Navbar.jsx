import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-title">SPK GURU BERPRESTASI SD</span>
        <span className="navbar-subtitle">Metode Weighted Product (WP) &bull; SDN 01 Harapan Bangsa</span>
      </div>

      <nav className="navbar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/kriteria"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Data Kriteria
        </NavLink>
        <NavLink
          to="/alternatif"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Data Guru (Alternatif)
        </NavLink>
        <NavLink
          to="/penilaian"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Matriks Penilaian
        </NavLink>
        <NavLink
          to="/perhitungan"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Perhitungan WP
        </NavLink>
        <NavLink
          to="/laporan"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Laporan & Peringkat
        </NavLink>
      </nav>

      <div className="navbar-user">
        <div className="user-badge">
          <div className="user-name">{user?.nama_lengkap || 'Pengguna'}</div>
          <div className="user-role">{user?.role === 'kepala_sekolah' ? 'Kepala Sekolah' : 'Administrator SD'}</div>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={logout}
        >
          Keluar Sistem
        </button>
      </div>
    </header>
  );
};

export default Navbar;
