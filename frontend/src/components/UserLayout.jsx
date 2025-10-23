// Contenido COMPLETO y CORREGIDO para frontend/src/components/UserLayout.jsx

import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaUser, FaStethoscope, FaSignOutAlt } from 'react-icons/fa';
import './UserLayout.css'; // Asegúrate de que el archivo CSS exista

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber qué ruta está activa

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Función para determinar si un enlace está activo
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="user-layout">
      {/* --- Barra Lateral del Paciente --- */}
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
        </div>
        <div className="sidebar-user-profile">
          <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
          <h3>{user?.username}</h3>
          <p>Paciente</p>
        </div>
        
        <nav className="sidebar-nav">
          {/* --- ¡ENLACES CORREGIDOS AQUÍ! --- */}
          <Link to="/user/dashboard" className={`nav-link ${isLinkActive('/user/dashboard') ? 'active' : ''}`}><FaTachometerAlt /> <span>Dashboard</span></Link>
          <Link to="/user/profile" className={`nav-link ${isLinkActive('/user/profile') ? 'active' : ''}`}><FaUser /> <span>Mi Perfil</span></Link>
          <Link to="/user/mis-citas" className={`nav-link ${isLinkActive('/user/mis-citas') ? 'active' : ''}`}><FaStethoscope /> <span>Mis Citas</span></Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button"><FaSignOutAlt /> <span>Cerrar Sesión</span></button>
        </div>
      </aside>

      {/* --- Área de Contenido Principal --- */}
      <main className="user-main-content">
        <Outlet /> {/* Outlet renderiza la ruta hija (ej. UserDashboard, Profile, etc.) */}
      </main>
    </div>
  );
}

export default UserLayout;