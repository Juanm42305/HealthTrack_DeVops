import React from 'react';
import { Link } from 'react-router-dom';
import './SobreNosotros.css';

const SobreNosotros = () => {
  return (
    <div className="sobre-nosotros-page">
      
      {/* --- NAVBAR --- */}
      <nav className="modern-navbar-dark">
        <div className="nav-links">
          <Link to="/">INICIO</Link>
          <Link to="/sobre-nosotros" className="active">SOBRE NOSOTROS</Link>
          <Link to="/sedes">SEDES</Link>
          <Link to="/contacto">CONTACTO</Link>
        </div>
        <div className="nav-actions">
          <button className="nav-pill-btn help">AYUDA</button>
          <Link to="/login" className="nav-pill-btn login">LOGIN</Link>
        </div>
      </nav>

      {/* --- SECCIÓN 1: ENCABEZADO CON FONDO --- */}
      <header className="about-header">
        <div className="header-content">
          <h1>Quiénes Somos</h1>
          <p>Comprometidos con tu bienestar y el de tu familia.</p>
        </div>
      </header>

      <div className="main-content-wrapper">
        
        {/* --- SECCIÓN 2: TEXTO INTRODUCTORIO --- */}
        <section className="intro-text-section">
          <h2>HEALTH TRACK</h2>
          <p>
            HealthTrack es una sociedad anónima constituida mediante la escritura pública para servir a la comunidad.
            Surge como Entidad Promotora de Salud del Régimen Contributivo a través de la resolución nacional,
            buscando siempre la excelencia en la prestación de servicios.
          </p>
          <p>
            Iniciamos operaciones con el objetivo claro de transformar la experiencia de salud digital,
            facilitando el acceso a especialistas y la gestión de historias clínicas de manera segura y eficiente.
          </p>
        </section>

        {/* --- SECCIÓN 3: MISIÓN, VISIÓN, VALORES --- */}
        <section className="cards-grid-section">
          
          {/* Tarjeta Misión */}
          <div className="info-card">
            <div className="card-image">
              {/* Usamos URL de internet para evitar el error de archivo no encontrado */}
              <img src="https://img.freepik.com/free-photo/team-young-specialist-doctors-standing-corridor-hospital_1303-21199.jpg" alt="Misión" />
            </div>
            <div className="card-content">
              <h3>Misión</h3>
              <p>
                Garantizar la gestión integral del riesgo en salud de nuestros afiliados, 
                generando bienestar y sostenibilidad mediante un modelo de atención humanizado y confiable.
              </p>
            </div>
          </div>

          {/* Tarjeta Visión */}
          <div className="info-card">
            <div className="card-image">
              <img src="https://img.freepik.com/free-photo/low-angle-view-skyscrapers_1359-1105.jpg" alt="Visión" />
            </div>
            <div className="card-content">
              <h3>Visión</h3>
              <p>
                Ser la entidad referente en el aseguramiento en salud, reconocida por su solidez, 
                innovación y la calidad humana de su servicio para el año 2030.
              </p>
            </div>
          </div>

          {/* Tarjeta Valores */}
          <div className="info-card">
            <div className="card-content full-height">
              <h3>Valores</h3>
              <ul className="values-list">
                <li>♥ Respeto y Compasión</li>
                <li>🛡️ Integridad y Transparencia</li>
                <li>🤝 Trabajo en Equipo</li>
                <li>💡 Innovación Constante</li>
                <li>⭐ Excelencia en el Servicio</li>
              </ul>
            </div>
          </div>

        </section>

        {/* --- SECCIÓN 4: CTA FINAL --- */}
        <section className="bottom-cta">
          <div className="cta-box">
            <h3>¿Necesitas Ayuda o Tienes Preguntas?</h3>
            <p>Nuestros asesores están disponibles para guiarte en todo el proceso.</p>
            <button className="cta-btn-green">Contactar Ahora</button>
          </div>
          <div className="cta-image-side">
             <img src="https://img.freepik.com/free-photo/call-center-worker-accompanied-by-her-team_1098-17930.jpg" alt="Atención al cliente" />
          </div>
        </section>

      </div>
    </div>
  );
};

export default SobreNosotros;