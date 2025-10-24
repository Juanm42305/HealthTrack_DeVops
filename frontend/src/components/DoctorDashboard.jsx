// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/DoctorDashboard.jsx

import React, { useState, useEffect } from 'react'; // <-- Añadir useState, useEffect
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaCalendarAlt, FaUsers, FaBookMedical, FaStethoscope, FaBell // <-- Añadir FaBell
} from 'react-icons/fa';
// Quitamos Swal si no hay errores que mostrar aquí
import './UserDashboard.css'; // Reutilizamos CSS, añadiremos estilos de notificación aquí

function DoctorDashboard() {
  const { user } = useAuth();

  // --- ¡NUEVO! Estado y lógica para notificaciones (movido desde Layout) ---
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Usamos los logs aquí también para asegurarnos
      console.log("[DoctorDashboard] Intentando cargar notificaciones para Doctor ID:", user?.id);

      // Agregamos chequeo extra por si ya cargó
      if (!user?.id || user.role !== 'medico' || loadingNotifications || notifications.length > 0) {
        console.log("[DoctorDashboard] No se cargan notificaciones. Razón:", {
             userId: user?.id,
             role: user?.role,
             loading: loadingNotifications,
             alreadyLoaded: notifications.length > 0
         });
         // Si no se carga, aseguramos quitar el estado de carga
         if(loadingNotifications) setLoadingNotifications(false);
         return;
      }

      setLoadingNotifications(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);
        console.log("[DoctorDashboard] Respuesta API notificaciones:", response.status, response.ok);

        if (response.ok) {
          const citas = await response.json();
          console.log("[DoctorDashboard] Citas para notificaciones:", citas);

          if (citas && citas.length > 0) {
            // Creamos objetos de notificación con más detalles
            const newNotifications = citas.slice(0, 5).map(cita => ({
              id: cita.id, // Guardamos ID por si se necesita
              message: `Cita agendada: ${cita.patient_nombres || 'Paciente'} ${cita.patient_apellido || ''}`,
              time: `${new Date(cita.appointment_time).toLocaleDateString('es-ES', {day:'numeric', month:'short'})} ${new Date(cita.appointment_time).toLocaleTimeString('en-US', {hour: 'numeric', minute:'2-digit', hour12: true})}`,
              sede: cita.sede
            }));
            console.log("[DoctorDashboard] Notificaciones formateadas:", newNotifications);
            setNotifications(newNotifications);
          } else {
            console.log("[DoctorDashboard] API OK, pero no se recibieron citas.");
            setNotifications([]);
          }
        } else {
           console.error("[DoctorDashboard] Error al cargar notificaciones - Respuesta no OK:", response.status);
        }
      } catch (error) {
        console.error('[DoctorDashboard] Error de conexión al cargar notificaciones - Catch:', error);
      } finally {
         setLoadingNotifications(false);
      }
    };

     if (user && user.role === 'medico') {
        fetchNotifications();
    }
  }, [user]); // Depende de user
  // --- FIN Lógica de Notificaciones ---


  return (
    <div className="user-dashboard-layout">

      <div className="welcome-header">
        <h1>Panel de Médico</h1>
        <p>Bienvenido, Dr. {user?.username}.</p>
      </div>

      {/* --- ¡NUEVA SECCIÓN DE NOTIFICACIONES ESTILO ALERTA! --- */}
      <section className="notifications-dashboard-section">
        <h2><FaBell /> Notificaciones Recientes</h2>
        {loadingNotifications ? (
          <p className="loading-notifications">Cargando notificaciones...</p>
        ) : notifications.length > 0 ? (
          <div className="notifications-grid">
            {notifications.map((notif) => (
              <div key={notif.id} className="notification-card">
                <p className="notification-message">{notif.message}</p>
                <p className="notification-details">{notif.time} - {notif.sede}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-notifications-dashboard">No hay notificaciones de citas nuevas.</p>
        )}
      </section>
      {/* --- FIN SECCIÓN NOTIFICACIONES --- */}


      {/* --- Widgets Principales --- */}
      <main className="widget-grid">
        <Link to="/doctor/citas" className="widget-link">
          <div className="widget user-widget">
            <FaCalendarAlt className="widget-icon" />
            <h3>Mis Citas</h3>
            <p>Ver tus citas agendadas para hoy y futuras.</p>
          </div>
        </Link>
        <Link to="/doctor/pacientes" className="widget-link">
          <div className="widget user-widget">
            <FaUsers className="widget-icon" />
            <h3>Pacientes</h3>
            <p>Buscar pacientes y ver sus perfiles.</p>
          </div>
        </Link>
        <Link to="/doctor/historiales" className="widget-link">
          <div className="widget user-widget">
            <FaBookMedical className="widget-icon" />
            <h3>Historiales Clínicos</h3>
            <p>Acceder a los historiales médicos completos.</p>
          </div>
        </Link>
        <Link to="/doctor/diagnosticos" className="widget-link">
          <div className="widget user-widget">
            <FaStethoscope className="widget-icon" />
            <h3>Diagnósticos</h3>
            <p>Registrar nuevos diagnósticos y tratamientos.</p>
          </div>
        </Link>
      </main>
    </div>
  );
}

export default DoctorDashboard;