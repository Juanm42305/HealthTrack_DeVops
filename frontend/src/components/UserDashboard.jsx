// Contenido para frontend/src/components/UserDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaCalendarCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Importamos el cerebro para saludar al usuario
import './UserDashboard.css'; // Importaremos el CSS

function UserDashboard() {
  const { user } = useAuth(); // Obtenemos la info del usuario logueado

  return (
    <div className="user-dashboard">
      <header className="main-header">
        <h1>Hola, {user.username}!</h1>
        <p>Bienvenido a tu portal de salud en HealthTrack.</p>
      </header>

      <div className="widget-grid">
        <Link to="/perfil-paciente" className="widget-link">
          <div className="widget">
            <FaUserEdit className="widget-icon" />
            <h3>Mi Perfil de Paciente</h3>
            <p>Completa y actualiza tu información personal y médica.</p>
          </div>
        </Link>

        <Link to="/agendar-cita" className="widget-link">
          <div className="widget">
            <FaCalendarCheck className="widget-icon" />
            <h3>Agendar Nueva Cita</h3>
            <p>Busca y reserva un horario disponible con nuestros especialistas.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default UserDashboard;