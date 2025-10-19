// Contenido COMPLETO y RECONSTRUIDO para frontend/src/components/UserDashboard.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarPlus, FaStethoscope, FaFileDownload, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import './UserDashboard.css'; // Importaremos el nuevo CSS

function UserDashboard() {
  const { user } = useAuth(); // Obtenemos la info del usuario logueado
  const navigate = useNavigate(); // Hook para la navegación, incluyendo el botón "atrás"

  // Función para el botón de "volver"
  const goBack = () => {
    navigate(-1); // Esto navega a la página anterior en el historial
  };

  // Funciones de ejemplo para los botones que aún no tienen página
  const handleComingSoon = (feature) => {
    alert(`La funcionalidad de "${feature}" estará disponible próximamente.`);
  };

  return (
    <div className="user-dashboard-layout">
      
      <header className="main-header">
        {/* --- ¡NUEVO! Botón para ir hacia atrás --- */}
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
        <div className="header-text">
          <h1>Hola, {user?.username}!</h1>
          <p>Bienvenido a tu portal de salud en HealthTrack.</p>
        </div>
      </header>

      {/* --- Rejilla de Widgets de Acción --- */}
      <main className="widget-grid">

        {/* Widget 1: Agendar Cita (Usa Link porque la ruta ya existe) */}
        <Link to="/agendar-cita" className="widget-link">
          <div className="widget user-widget">
            <FaCalendarPlus className="widget-icon" />
            <h3>Agendar Nueva Cita</h3>
            <p>Busca y reserva un horario disponible con nuestros especialistas.</p>
          </div>
        </Link>

        {/* Widget 2: Mis Citas (Usa Link porque la ruta ya existe) */}
        <Link to="/mis-citas" className="widget-link">
          <div className="widget user-widget">
            <FaStethoscope className="widget-icon" />
            <h3>Mis Citas</h3>
            <p>Consulta tus próximas citas, su estado y cancélalas si es necesario.</p>
          </div>
        </Link>

        {/* Widget 3: Descargar Resultados (Usa un botón con alerta) */}
        <div className="widget user-widget" onClick={() => handleComingSoon('Descargar Resultados')}>
          <FaFileDownload className="widget-icon" />
          <h3>Descargar Resultados</h3>
          <p>Accede a los resultados de tus exámenes de laboratorio y estudios.</p>
          <button className="widget-button-placeholder">Próximamente</button>
        </div>

        {/* Widget 4: Mis Facturas (Usa un botón con alerta) */}
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