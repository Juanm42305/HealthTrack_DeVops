// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/UserLayout.jsx
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// --- ¡Añade FaFileInvoiceDollar! ---
import { FaTachometerAlt, FaUser, FaCalendarCheck, FaSignOutAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import './UserLayout.css'; 
import { FaNotesMedical } from 'react-icons/fa';

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="user-layout-container">
      <aside className="user-sidebar">
        {/* ... (header y profile info) ... */}
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
          
          {/* --- ¡AÑADE ESTE LINK! --- */}
          <Link 
            to="/user/mis-facturas" 
            className={`nav-link ${isLinkActive('/user/mis-facturas') ? 'active' : ''}`}
          >
            <FaFileInvoiceDollar /> <span>Mis Facturas</span>
          </Link>

          <Link to="/user/mis-diagnosticos" className={`nav-link ${isLinkActive('/user/mis-diagnosticos') ? 'active' : ''}`}>
               <FaNotesMedical /> <span>Mis Diagnósticos</span>
         </Link>
        </nav>

        {/* ... (sidebar footer) ... */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="user-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;