// Contenido COMPLETO para frontend/src/components/UserLayout.jsx

import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaUser, FaCalendarCheck, FaSignOutAlt } from 'react-icons/fa';
import './UserLayout.css'; // Crearemos este archivo CSS

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Para saber qué enlace está activo

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Función para ver si el enlace está activo
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="user-layout-container">
      {/* --- ESTA ES LA ÚNICA BARRA LATERAL --- */}
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
        </div>
        
        <div className="user-profile-info">
          <div className="user-avatar-placeholder">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="user-name">{user?.username}</h3>
          <p className="user-role">{user?.role === 'usuario' ? 'Paciente' : user?.role}</p>
        </div>

        <nav className="user-nav">
          <Link 
            to="/user/dashboard" 
            className={`nav-link ${isLinkActive('/user/dashboard') ? 'active' : ''}`}
          >
            <FaTachometerAlt /> <span>Dashboard</span>
          </Link>
          <Link 
            to="/user/profile" 
            className={`nav-link ${isLinkActive('/user/profile') ? 'active' : ''}`}
          >
            <FaUser /> <span>Mi Perfil</span>
          </Link>
          <Link 
            to="/user/mis-citas" 
            className={`nav-link ${isLinkActive('/user/mis-citas') ? 'active' : ''}`}
          >
            <FaCalendarCheck /> <span>Mis Citas</span>
          </Link>
          {/* Puedes añadir más enlaces aquí, como "Agendar Cita" */}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO PRINCIPAL --- */}
      <main className="user-main-content">
        {/* Aquí es donde se cargarán Profile.jsx, MisCitas.jsx, etc. */}
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;