// Contenido MODIFICADO para frontend/src/components/DoctorLayout.jsx

import React, { useState, useEffect } from 'react'; // <-- Añadir useState, useEffect
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaUserMd, FaUsers, FaBookMedical, 
  FaCalendarAlt, FaStethoscope, FaFlask, FaSignOutAlt, FaBell // <-- Ícono de campana
} from 'react-icons/fa';
import Swal from 'sweetalert2'; // <-- Para posibles errores
import './DoctorLayout.css'; 

function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- ¡NUEVO! Estado para las notificaciones ---
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false); // Para evitar cargas múltiples

  // --- ¡NUEVO! Efecto para cargar notificaciones (citas futuras) ---
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || user.role !== 'medico' || loadingNotifications) return; 
      
      setLoadingNotifications(true); // Marcar como cargando
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        // Reutilizamos la misma llamada que DoctorCitas para simplicidad
        const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);
        if (response.ok) {
          const citas = await response.json();
          // Creamos los mensajes de notificación (limitamos a 5 por ejemplo)
          const newNotifications = citas.slice(0, 5).map(cita => (
            `Nueva cita: ${cita.patient_nombres || 'Paciente'} ${cita.patient_apellido || ''} - ${new Date(cita.appointment_time).toLocaleDateString('es-ES', {day:'numeric', month:'short'})} ${new Date(cita.appointment_time).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}`
          ));
          setNotifications(newNotifications);
        } else {
           console.error("Error al cargar notificaciones (citas)");
           // Podrías poner un Swal.fire aquí si quieres alertar al doctor
        }
      } catch (error) {
        console.error('Error de conexión al cargar notificaciones:', error);
      } finally {
        // No necesitamos setLoadingNotifications = false aquí si solo carga una vez
      }
    };

    fetchNotifications();
    // Solo depende del user.id para cargar una vez al inicio
  }, [user]); 


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
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
        </div>
        
        <div className="user-profile-info">
          {/* ... (Avatar, nombre, rol como antes) ... */}
           <div className="user-avatar-placeholder" style={{ background: '#27ae60' }}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="user-name">{user?.username}</h3>
          <p className="user-role">Médico</p>
        </div>

        {/* --- ¡NUEVO! Sección de Notificaciones --- */}
        <div className="notifications-section">
          <h4><FaBell /> Notificaciones Recientes</h4>
          {notifications.length > 0 ? (
            <ul className="notifications-list">
              {notifications.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          ) : (
            <p className="no-notifications">No hay notificaciones nuevas.</p>
          )}
        </div>
        {/* --- FIN Notificaciones --- */}


        <nav className="user-nav">
          {/* ... (Tus Links como antes) ... */}
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