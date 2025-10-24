// Contenido COMPLETO y CON LOGS para frontend/src/components/DoctorLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTachometerAlt, FaUserMd, FaUsers, FaBookMedical, 
  FaCalendarAlt, FaStethoscope, FaFlask, FaSignOutAlt, FaBell 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './DoctorLayout.css'; 

function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false); 

  // --- Efecto para cargar notificaciones (con LOGS) ---
  useEffect(() => {
    const fetchNotifications = async () => {
      // --- ¡DEBUG LOG 1! ---
      console.log("[DoctorLayout] Intentando cargar notificaciones para Doctor ID:", user?.id); 
      
      // Añadimos una comprobación extra: ¿ya se cargaron?
      if (!user?.id || user.role !== 'medico' || loadingNotifications || notifications.length > 0) {
         // --- ¡DEBUG LOG 2! ---
         console.log("[DoctorLayout] No se cargan notificaciones. Razón:", { 
             userId: user?.id, 
             role: user?.role, 
             loading: loadingNotifications,
             alreadyLoaded: notifications.length > 0 // Indica si ya se cargaron
         });
         return; 
      }
      
      setLoadingNotifications(true); 
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);
        
        // --- ¡DEBUG LOG 3! ---
        console.log("[DoctorLayout] Respuesta de API para notificaciones:", response.status, response.ok);

        if (response.ok) {
          const citas = await response.json();
          // --- ¡DEBUG LOG 4! ---
          console.log("[DoctorLayout] Citas recibidas para notificaciones:", citas); 

          // Verificamos si realmente hay citas antes de mapear
          if (citas && citas.length > 0) {
              const newNotifications = citas.slice(0, 5).map(cita => (
                `Nueva cita: ${cita.patient_nombres || 'Paciente'} ${cita.patient_apellido || ''} - ${new Date(cita.appointment_time).toLocaleDateString('es-ES', {day:'numeric', month:'short'})} ${new Date(cita.appointment_time).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}`
              ));
              
              // --- ¡DEBUG LOG 5! ---
              console.log("[DoctorLayout] Notificaciones formateadas:", newNotifications); 
              setNotifications(newNotifications);
          } else {
              // --- ¡DEBUG LOG 6! ---
              console.log("[DoctorLayout] API OK, pero no se recibieron citas (array vacío o nulo).");
              setNotifications([]); // Asegura que quede vacío si no hay citas
          }
          
        } else {
           console.error("[DoctorLayout] Error al cargar notificaciones (citas) - Respuesta no OK:", response.status);
           // Opcional: Mostrar alerta al usuario
           // Swal.fire('Error', `No se pudieron cargar las notificaciones (${response.status})`, 'error');
        }
      } catch (error) {
        console.error('[DoctorLayout] Error de conexión al cargar notificaciones - Catch:', error);
         // Opcional: Mostrar alerta al usuario
         // Swal.fire('Error', 'Error de conexión al cargar notificaciones.', 'error');
      } finally {
         // Importante ponerlo en false para permitir reintentos si fuera necesario (aunque aquí solo carga una vez)
         setLoadingNotifications(false); 
      }
    };

    // Solo ejecuta si hay un usuario logueado y es médico
    if (user && user.role === 'medico') {
        fetchNotifications();
    }
    
  // Dependencias: Ejecuta cuando 'user' cambie (al loguearse)
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
        {/* ... (Header, Profile Info sin cambios) ... */}
        <div className="sidebar-header"> <h3>💙 HealthTrack</h3> </div>
        <div className="user-profile-info">
          <div className="user-avatar-placeholder" style={{ background: '#27ae60' }}> {user?.username.charAt(0).toUpperCase()} </div>
          <h3 className="user-name">{user?.username}</h3>
          <p className="user-role">Médico</p>
        </div>

        {/* Sección de Notificaciones */}
        <div className="notifications-section">
          <h4><FaBell /> Notificaciones Recientes</h4>
          {/* Mostramos mensaje de carga si está buscando */}
          {loadingNotifications ? (
             <p className="no-notifications">Cargando...</p>
          ) : notifications.length > 0 ? (
            <ul className="notifications-list">
              {notifications.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          ) : (
            <p className="no-notifications">No hay notificaciones nuevas.</p>
          )}
        </div>

        {/* Navegación */}
        <nav className="user-nav">
          {/* ... (Links sin cambios) ... */}
           <Link to="/doctor/dashboard" className={`nav-link ${isLinkActive('/doctor/dashboard') ? 'active' : ''}`}> <FaTachometerAlt /> <span>Dashboard</span> </Link>
           <Link to="/doctor/profile" className={`nav-link ${isLinkActive('/doctor/profile') ? 'active' : ''}`}> <FaUserMd /> <span>Mi Perfil</span> </Link>
           <Link to="/doctor/citas" className={`nav-link ${isLinkActive('/doctor/citas') ? 'active' : ''}`}> <FaCalendarAlt /> <span>Mis Citas</span> </Link>
           <Link to="/doctor/pacientes" className={`nav-link ${isLinkActive('/doctor/pacientes') ? 'active' : ''}`}> <FaUsers /> <span>Pacientes</span> </Link>
           <Link to="/doctor/historiales" className={`nav-link ${isLinkActive('/doctor/historiales') ? 'active' : ''}`}> <FaBookMedical /> <span>Historiales</span> </Link>
           <Link to="/doctor/diagnosticos" className={`nav-link ${isLinkActive('/doctor/diagnosticos') ? 'active' : ''}`}> <FaStethoscope /> <span>Diagnósticos</span> </Link>
           <Link to="/doctor/resultados" className={`nav-link ${isLinkActive('/doctor/resultados') ? 'active' : ''}`}> <FaFlask /> <span>Resultados</span> </Link>
        </nav>

        {/* Footer */}
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