import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="modern-welcome-layout">
      
      {/* --- NAV SUPERIOR --- */}
      <nav className="modern-navbar">
        <div className="nav-links">
          <Link to="/">INICIO</Link>
          <Link to="/sobre-nosotros">SOBRE NOSOTROS</Link>
          <Link to="/sedes">SEDES</Link>
          <Link to="/contacto">CONTACTO</Link> {/* <-- ENLACE ACTUALIZADO */}
        </div>
        <div className="nav-actions">
          <button className="nav-pill-btn help">AYUDA</button>
          {isHomePage && (
             <Link to="/login" className="nav-pill-btn login">LOGIN</Link>
          )}
        </div>
      </nav>

      {/* --- CONTENIDO CENTRAL --- */}
      <div className="central-card-container">
        
        <div className="hero-text-side">
          <h1>Hospital<br/>Portal</h1>
          <p>Tu salud, gestionada de forma inteligente.</p>
        </div>

        <div className="white-glass-card">
          {isHomePage ? (
            <div className="home-content">
              <div className="avatar-circle">
                👤
              </div>
              <h2>Bienvenido</h2>
              <p>Accede a tu portal de salud</p>
              <Link to="/login" className="orange-action-btn">
                Ingresar / Registrarse
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </div>

      </div>
    </div>
  );
}

export default WelcomePage;