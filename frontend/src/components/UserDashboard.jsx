// Contenido COMPLETO y LIMPIO para frontend/src/components/UserDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // Ya no se usa useNavigate aquí
import { useAuth } from '../context/AuthContext';
import { FaCalendarPlus, FaStethoscope, FaFileDownload, FaFileInvoice } from 'react-icons/fa'; // Se fue FaArrowLeft
import Swal from 'sweetalert2';
import './UserDashboard.css';

function UserDashboard() {
  const { user } = useAuth();
  // Se eliminó navigate y goBack

  const handleComingSoon = (feature) => {
    Swal.fire({
      title: 'Próximamente',
      text: `La funcionalidad de "${feature}" estará disponible pronto.`,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  };

  // --- ¡DISEÑO SIMPLIFICADO! ---
  // Se eliminó el <header> y el botón "Volver"
  return (
    <div className="user-dashboard-layout">
      
      {/* Mensaje de bienvenida (sin el header de antes) */}
      <div className="welcome-header">
        <h1>Hola, {user?.username}!</h1>
        <p>Bienvenido a tu portal de salud en HealthTrack.</p>
      </div>

      <main className="widget-grid">

        <Link to="/user/agendar-cita" className="widget-link">
          <div className="widget user-widget">
            <FaCalendarPlus className="widget-icon" />
            <h3>Agendar Nueva Cita</h3>
            
            <p>Busca y reserva un horario disponible con nuestros especialistas.</p>
          </div>
        </Link>

        {/* ¡CAMBIO AQUÍ! Convertido a Link */}
        <Link to="/user/resultados" className="widget-link">
          <div className="widget user-widget">
            <FaFileDownload className="widget-icon" />
            <h3>Descargar Resultados</h3>
            <p>Accede a los resultados de tus exámenes de laboratorio y estudios.</p>
          </div>
        </Link>

        <div className="widget user-widget" onClick={() => handleComingSoon('Mis Facturas')}>
          <FaFileInvoice className="widget-icon" />
          <h3>Mis Facturas</h3>
          <p>Consulta y descarga tus facturas y estados de cuenta.</p>
          <button className="widget-button-placeholder">Próximamente</button>
        </div>

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