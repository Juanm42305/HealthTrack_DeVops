// Contenido COMPLETO y DEFINITIVO para frontend/src/components/WelcomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css'; // Asegúrate de que importe SU PROPIO CSS

function WelcomePage() {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <Link to="/" className="healthtrack-logo-link">
          <span className="healthtrack-logo-text">💙 HealthTrack</span>
        </Link>
        <nav className="welcome-nav">
          <Link to="/login" className="nav-button">Iniciar Sesión</Link>
          <Link to="/register" className="nav-button primary">Registrarse</Link>
        </nav>
      </header>

      <main className="welcome-main-content">
        <section className="welcome-text-section">
          <h1>Bienvenido a HealthTrack</h1>
          <p>Tu plataforma integral para la gestión de salud. Agenda citas, consulta tu historial y mantente en contacto con tus médicos, todo en un solo lugar.</p>
          <div className="call-to-action-buttons">
            <Link to="/login" className="cta-button secondary">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="cta-button primary">
              Crear Cuenta
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WelcomePage;