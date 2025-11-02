// Contenido CORREGIDO FINAL para frontend/src/components/DoctorDashboard.jsx

import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaCalendarAlt, FaUsers, FaBookMedical, FaStethoscope, FaBell 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './UserDashboard.css'; 

function DoctorDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || user.role !== 'medico' || loadingNotifications || notifications.length > 0) {
         if(loadingNotifications) setLoadingNotifications(false);
         return;
      }

      setLoadingNotifications(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);

        if (response.ok) {
          const citas = await response.json();

          if (citas && citas.length > 0) {
            const newNotifications = citas.slice(0, 5).map(cita => {
                // Lógica de hora UTC
                const date = new Date(cita.appointment_time);
                let hours = date.getUTCHours();
                const minutes = date.getUTCMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; 
                const minStr = minutes < 10 ? '0' + minutes : minutes;
                const timeStr = `${hours}:${minStr} ${ampm}`;

                return {
                    id: cita.id, 
                    message: `Cita agendada: ${cita.patient_nombres || 'Paciente'} ${cita.patient_apellido || ''}`,
                    time: `${new Date(cita.appointment_time).toLocaleDateString('es-ES', {day:'numeric', month:'short'})} ${timeStr}`,
                    sede: cita.sede
                };
            });
            setNotifications(newNotifications);
          } else {
            setNotifications([]);
          }
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
  }, [user]); 


  return (
    <div className="user-dashboard-layout">

      <div className="welcome-header">
        <h1>Panel de Médico</h1>
        <p>Bienvenido, Dr. {user?.username}.</p>
      </div>

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