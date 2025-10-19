// Contenido completo y rediseñado para frontend/src/components/AdminDashboard.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserMd, FaCalendarAlt, FaFileInvoiceDollar, FaFlask, FaSignOutAlt } from 'react-icons/fa';
import './AdminDashboard.css'; // Asegúrate de que este archivo CSS existe y está vinculado

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirigir a la página de bienvenida al cerrar sesión
  };

  return (
    <div className="admin-dashboard-layout">
      
      {/* --- Barra Lateral de Navegación del Admin --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-user-profile">
          <div className="avatar-placeholder">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.username}</h3>
          <p>Administrador</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link active">
            <FaUserMd /> <span>Dashboard</span>
          </Link>
          <Link to="/admin/gestion-medicos" className="nav-link">
            <FaUserMd /> <span>Gestión de Médicos</span>
          </Link>
          <Link to="/admin/gestion-citas" className="nav-link">
            <FaCalendarAlt /> <span>Gestión de Citas</span>
          </Link>
          <Link to="/admin/facturacion" className="nav-link">
            <FaFileInvoiceDollar /> <span>Facturación</span>
          </Link>
          <Link to="/admin/laboratorio" className="nav-link">
            <FaFlask /> <span>Laboratorio</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* --- Área de Contenido Principal --- */}
      <main className="admin-main-content">
        <header className="main-header">
          <h1>Panel de Control</h1>
          <p>Bienvenido, aquí puedes gestionar toda la plataforma.</p>
        </header>

        {/* Los widgets de acción rápida */}
        <div className="widget-grid">
          {/* ... tu código de widgets para Añadir Médico, etc., sigue aquí ... */}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;