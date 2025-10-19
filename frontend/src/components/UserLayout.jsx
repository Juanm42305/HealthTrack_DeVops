// Contenido COMPLETO para el NUEVO archivo frontend/src/components/UserLayout.jsx

import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaUser, FaStethoscope, FaSignOutAlt } from 'react-icons/fa';
import './UserLayout.css'; // Crearemos este archivo CSS

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
          <Link to="/dashboard" className="nav-link"><FaTachometerAlt /> <span>Dashboard</span></Link>
          <Link to="/profile" className="nav-link"><FaUser /> <span>Mi Perfil</span></Link>
          <Link to="/mis-citas" className="nav-link"><FaStethoscope /> <span>Mis Citas</span></Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button"><FaSignOutAlt /> <span>Cerrar Sesión</span></button>
        </div>
      </aside>

      {/* --- Área de Contenido Principal (Aquí se mostrarán las páginas) --- */}
      <main className="user-main-content">
        <Outlet /> {/* ¡La magia está aquí! Outlet renderiza la ruta hija */}
      </main>
    </div>
  );
}

export default UserLayout;