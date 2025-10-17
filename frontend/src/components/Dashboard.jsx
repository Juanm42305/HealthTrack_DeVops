// frontend/src/components/Dashboard.jsx

import React from 'react';
import { FaUserMd, FaCalendarAlt, FaChartBar } from 'react-icons/fa'; // Iconos para los botones
import './Dashboard.css'; // Importaremos el CSS que crearemos a continuación

function Dashboard() {

  // Esta será la función para un botón
  const handleAgendarCita = () => {
    alert("Funcionalidad para agendar cita próximamente...");
  };

  return (
    // Contenedor principal de toda la página del dashboard
    <div className="dashboard-container">
      
      {/* Contenedor para el encabezado de bienvenida */}
      <header className="dashboard-header">
        <h1>Bienvenido a HealthTrack</h1>
        <p>Tu panel de control de salud centralizado.</p>
      </header>

      {/* Contenedor para las tarjetas o "widgets". Usaremos CSS Grid para organizarlos */}
      <main className="widget-grid">

        {/* Widget 1: Agendar Cita */}
        <div className="widget">
          <FaCalendarAlt className="widget-icon" />
          <h3>Agendar Cita</h3>
          <p>Encuentra un especialista y reserva tu próxima cita médica.</p>
          <button onClick={handleAgendarCita}>Agendar ahora</button>
        </div>

        {/* Widget 2: Ver Pacientes */}
        <div className="widget">
          <FaUserMd className="widget-icon" />
          <h3>Mis Pacientes</h3>
          <p>Consulta el historial y la información de tus pacientes.</p>
          <button>Ver pacientes</button>
        </div>

        {/* Widget 3: Estadísticas */}
        <div className="widget">
          <FaChartBar className="widget-icon" />
          <h3>Estadísticas</h3>
          <p>Visualiza reportes y análisis de tu actividad.</p>
          <button>Ver reportes</button>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;