import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaMobileAlt, FaBuilding } from 'react-icons/fa';
import './Contacto.css';

const Contacto = () => {
  return (
    <div className="contacto-page">
      
      {/* --- NAVBAR (Estilo oscuro para que combine con el fondo) --- */}
      <nav className="contact-navbar">
        <div className="nav-links">
          <Link to="/">INICIO</Link>
          <Link to="/sobre-nosotros">SOBRE NOSOTROS</Link>
          <Link to="/sedes">SEDES</Link>
          <Link to="/contacto" className="active">CONTACTO</Link>
        </div>
        <div className="nav-actions">
          <button className="nav-pill-btn help">AYUDA</button>
          <Link to="/login" className="nav-pill-btn login">LOGIN</Link>
        </div>
      </nav>

      <div className="contacto-container">
        <h1 className="contacto-title">LÍNEAS DE ATENCIÓN</h1>

        <div className="info-grid">
          
          {/* Columna Izquierda: Régimen Contributivo */}
          <div className="info-column">
            <h3 className="section-subtitle">• Régimen Contributivo</h3>
            <p className="info-text">
              Marca desde teléfono fijo a la línea gratuita nacional al<br />
              <span className="highlight-number">01 8000 954400</span>
            </p>
            <p className="info-text">
              En Bogotá, desde fijo o celular, al<br />
              <span className="highlight-number">(601) 307 7022</span>
            </p>
          </div>

          {/* Columna Derecha: Régimen Subsidiado */}
          <div className="info-column">
            <h3 className="section-subtitle">• Régimen Subsidiado</h3>
            <p className="info-text">
              Marca desde teléfono fijo a la línea gratuita nacional al<br />
              <span className="highlight-number">01 8000 952000</span>
            </p>
            <p className="info-text">
              En Bogotá, desde fijo o celular, al<br />
              <span className="highlight-number">(601) 307 70 51</span>
            </p>
            <p className="small-note">
              (únicamente para operadores Claro, Tigo y Movistar) Desde 
              teléfono fijo, o cualquier operador celular, a la línea gratuita:
              <strong> 01 8000 930100</strong>
            </p>
          </div>
        </div>

        <hr className="divider-line" />

        {/* Sección Administrativa */}
        <div className="admin-section">
          <div className="admin-header">
            <div className="icon-circle"><FaBuilding /></div>
            <h3>Oficinas administrativas</h3>
          </div>

          <div className="admin-details">
            <div className="detail-item">
              <h4>• Dirección Nacional</h4>
              <p>Carrera 85K No. 46A-66</p>
              <p>Bogotá D.C., Colombia</p>
            </div>
            
            <div className="detail-item">
              <h4>Teléfono administrativo</h4>
              <p className="highlight-number">(601) 419 3000</p>
            </div>
          </div>
          
          <Link to="/sedes" className="link-sedes">Conoce las Sedes administrativas</Link>
        </div>

        {/* Botón Contáctanos */}
        <div className="cta-container">
          <button className="btn-contactanos">
            <span className="v-icon">♥</span> Contáctanos <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Contacto;