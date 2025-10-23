// Contenido COMPLETO y CORREGIDO para frontend/src/components/UserDashboard.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarPlus, FaStethoscope, FaFileDownload, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import './UserDashboard.css';

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const handleComingSoon = (feature) => {
    alert(`La funcionalidad de "${feature}" estará disponible próximamente.`);
  };

  return (
    <div className="user-dashboard-layout">
      
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
        <div className="header-text">
          <h1>Hola, {user?.username}!</h1>
          <p>Bienvenido a tu portal de salud en HealthTrack.</p>
        </div>
      </header>

      <main className="widget-grid">

        {/* --- ¡ENLACE CORREGIDO! --- */}
        <Link to="/user/agendar-cita" className="widget-link">
          <div className="widget user-widget">
            <FaCalendarPlus className="widget-icon" />
            <h3>Agendar Nueva Cita</h3>
            <p>Busca y reserva un horario disponible con nuestros especialistas.</p>
          </div>
        </Link>

        {/* --- ¡ENLACE CORREGIDO! --- */}
        <Link to="/user/mis-citas" className="widget-link">
          <div className="widget user-widget">
            <FaStethoscope className="widget-icon" />
            <h3>Mis Citas</h3>
            <p>Consulta tus próximas citas, su estado y cancélalas si es necesario.</p>
          </div>
        </Link>

        <div className="widget user-widget" onClick={() => handleComingSoon('Descargar Resultados')}>
          <FaFileDownload className="widget-icon" />
          <h3>Descargar Resultados</h3>
          <p>Accede a los resultados de tus exámenes de laboratorio y estudios.</p>
          <button className="widget-button-placeholder">Próximamente</button>
        </div>

        <div className="widget user-widget" onClick={() => handleComingSoon('Mis Facturas')}>
          <FaFileInvoice className="widget-icon" />
          <h3>Mis Facturas</h3>
          <p>Consulta y descarga tus facturas y estados de cuenta.</p>
          <button className="widget-button-placeholder">Próximamente</button>
        </div>

      </main>
    </div>
  );
}

export default UserDashboard;