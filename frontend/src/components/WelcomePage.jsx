import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './WelcomePage.css';

function WelcomePage() {
  const location = useLocation();
  // Si estamos en la raíz ('/'), mostramos el contenido de bienvenida.
  // Si estamos en '/login' o '/register', mostramos el Outlet (el formulario).
  const isHomePage = location.pathname === '/';

  return (
    <div className="modern-welcome-layout">
      
      {/* --- NAV SUPERIOR --- */}
      <nav className="modern-navbar">
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="#">Sobre Nosotros</Link>
          <Link to="#">Sedes</Link>
          <Link to="#">Contacto</Link>
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
        
        {/* Texto grande a la izquierda */}
        <div className="hero-text-side">
          <h1>Hospital<br/>Portal</h1>
          <p>Tu salud, gestionada de forma inteligente.</p>
        </div>

        {/* Tarjeta Blanca Derecha */}
        <div className="white-glass-card">
          {isHomePage ? (
            // Contenido de la Home (cuando no estás logueándote)
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
            // Aquí se carga el Login.jsx cuando la ruta es /login
            <Outlet />
          )}
        </div>

      </div>
    </div>
  );
}

export default WelcomePage;