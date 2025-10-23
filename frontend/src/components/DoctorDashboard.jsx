// Contenido COMPLETO para frontend/src/components/DoctorDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaUsers, FaBookMedical, FaStethoscope } from 'react-icons/fa';
import './UserDashboard.css'; // ¡REUTILIZAMOS el CSS del dashboard de usuario!

function DoctorDashboard() {
  const { user } = useAuth();

  return (
    <div className="user-dashboard-layout"> {/* Reutilizamos la clase */}
      
      <div className="welcome-header">
        <h1>Panel de Médico</h1>
        <p>Bienvenido, Dr. {user?.username}.</p>
      </div>

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