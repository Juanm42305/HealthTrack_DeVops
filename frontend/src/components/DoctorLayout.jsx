// Contenido COMPLETO y LIMPIO para frontend/src/components/DoctorLayout.jsx

import React from 'react'; // Ya no se necesita useState ni useEffect aquí
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt, FaUserMd, FaUsers, FaBookMedical,
  FaCalendarAlt, FaStethoscope, FaFlask, FaSignOutAlt
  // Se quitó FaBell
} from 'react-icons/fa';
// Ya no se necesita Swal aquí
import './DoctorLayout.css';

function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se eliminó el estado y el useEffect de notifications

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="doctor-layout-container">
      <aside className="doctor-sidebar">
        <div className="sidebar-header"> <h3>💙 HealthTrack</h3> </div>
        <div className="user-profile-info">
          <div className="user-avatar-placeholder" style={{ background: '#27ae60' }}> {user?.username.charAt(0).toUpperCase()} </div>
          <h3 className="user-name">{user?.username}</h3>
          <p className="user-role">Médico</p>
        </div>

        {/* --- SECCIÓN DE NOTIFICACIONES ELIMINADA --- */}

        <nav className="user-nav"> {/* Ahora este nav usará el espacio */}
           <Link to="/doctor/dashboard" className={`nav-link ${isLinkActive('/doctor/dashboard') ? 'active' : ''}`}> <FaTachometerAlt /> <span>Dashboard</span> </Link>
           <Link to="/doctor/profile" className={`nav-link ${isLinkActive('/doctor/profile') ? 'active' : ''}`}> <FaUserMd /> <span>Mi Perfil</span> </Link>
           <Link to="/doctor/citas" className={`nav-link ${isLinkActive('/doctor/citas') ? 'active' : ''}`}> <FaCalendarAlt /> <span>Mis Citas</span> </Link>
           <Link to="/doctor/pacientes" className={`nav-link ${isLinkActive('/doctor/pacientes') ? 'active' : ''}`}> <FaUsers /> <span>Pacientes</span> </Link>
           <Link to="/doctor/historiales" className={`nav-link ${isLinkActive('/doctor/historiales') ? 'active' : ''}`}> <FaBookMedical /> <span>Historiales</span> </Link>
           <Link to="/doctor/diagnosticos" className={`nav-link ${isLinkActive('/doctor/diagnosticos') ? 'active' : ''}`}> <FaStethoscope /> <span>Diagnósticos</span> </Link>
           <Link to="/doctor/resultados" className={`nav-link ${isLinkActive('/doctor/resultados') ? 'active' : ''}`}> <FaFlask /> <span>Resultados</span> </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="doctor-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DoctorLayout;