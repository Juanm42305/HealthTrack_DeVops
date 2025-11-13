import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="modern-welcome-layout">
      
      {/* --- NAV SUPERIOR (Como en la imagen) --- */}
      <nav className="modern-navbar">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="#">About</Link>
          <Link to="#">Communities</Link>
          <Link to="#">Contacts</Link>
        </div>
        <div className="nav-actions">
          <button className="nav-pill-btn help">HELP</button>
          {/* Si estamos en home, mostramos botón Login que lleva a la ruta */}
          {isHomePage && (
             <Link to="/login" className="nav-pill-btn login">LOGIN</Link>
          )}
        </div>
      </nav>

      {/* --- CONTENIDO CENTRAL (El cuadro blanco) --- */}
      <div className="central-card-container">
        
        <div className="hero-text-side">
          {/* Texto flotante al lado (Opcional, como dice "Hospital Portal" en tu imagen) */}
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
                Ingresar
              </Link>
              <div style={{marginTop: '10px'}}>
                <Link to="/register" style={{color: '#888', fontSize: '0.9rem', textDecoration: 'none'}}>
                  ¿No tienes cuenta? Regístrate
                </Link>
              </div>
            </div>
          ) : (
            /* Aquí se carga el Login o Register dentro de la tarjeta blanca */
            <Outlet />
          )}
        </div>

      </div>
    </div>
  );
}

export default WelcomePage;