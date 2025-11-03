// Contenido CORREGIDO para frontend/src/components/WelcomePage.jsx (Ahora funciona como Layout)

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom'; 
import './WelcomePage.css';

function WelcomePage() {
  const location = useLocation();
  // Solo la ruta raíz (/) muestra el contenido de bienvenida
  const isHomePage = location.pathname === '/'; 

  return (
    <div className="welcome-container">
      {/* 1. HEADER (Lo mostramos siempre, incluso en /login o /register) */}
      <header className="welcome-header">
        <Link to="/" className="healthtrack-logo-link">
          <span className="healthtrack-logo-text">💙 HealthTrack</span>
        </Link>
        <nav className="welcome-nav">
          {/* Los botones aparecen solo en la HOME */}
          {isHomePage && (
              <>
                  <Link to="/login" className="nav-button">Iniciar Sesión</Link>
                  <Link to="/register" className="nav-button primary">Registrarse</Link>
              </>
          )}
        </nav>
      </header>

      {isHomePage ? (
        // 2. CONTENIDO PRINCIPAL (SOLO si estamos en la ruta raíz)
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
      ) : (
        // 3. OUTLET (Si estamos en una ruta anidada como /login o /register)
        // El Outlet centrará el Login/Register Formulario
        <Outlet />
      )}
    </div>
  );
}

export default WelcomePage;