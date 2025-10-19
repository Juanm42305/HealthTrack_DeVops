// Contenido para frontend/src/components/WelcomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css'; // Asegúrate de crear este archivo CSS

function WelcomePage() {
  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <div className="logo-section">
          <Link to="/" className="healthtrack-logo-link">
            <span className="healthtrack-logo-text">💙 HealthTrack</span>
          </Link>
        </div>
        <nav className="welcome-nav">
          <Link to="/login" className="nav-button">Iniciar Sesión</Link>
          <Link to="/register" className="nav-button primary">Registro</Link>
        </nav>
      </header>

      <main className="welcome-main-content">
        <div className="welcome-text-section">
          <h1>¡Tu salud es nuestra prioridad!</h1>
          <p>
            Gestiona tus citas médicas, accede a tu historial y mantente conectado con tus especialistas.
            Tu bienestar, optimizado y al alcance de tu mano.
          </p>
          <div className="call-to-action-buttons">
            <Link to="/register" className="cta-button primary">Regístrate Ahora</Link>
            <Link to="/login" className="cta-button secondary">Ya tengo cuenta</Link>
          </div>
        </div>
        {/* La imagen de fondo se manejará con CSS */}
      </main>

      {/* Puedes añadir un footer si lo deseas */}
      {/*
      <footer className="welcome-footer">
        <p>&copy; {new Date().getFullYear()} HealthTrack. Todos los derechos reservados.</p>
      </footer>
      */}
    </div>
  );
}

export default WelcomePage;