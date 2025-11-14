import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sedes.css';

// Datos de ejemplo para las sedes (puedes editarlos fácilmente aquí)
const sedesData = [
  {
    region: "Dirección Nacional",
    direccion: "Calle 26 # 69 - 76, Torre 3, Piso 11, Bogotá D.C.",
    telefono: "(601) 307 70 22",
    horario: "Lunes a Viernes: 7:00 AM - 5:00 PM"
  },
  {
    region: "Regional Bogotá",
    direccion: "Carrera 10 # 24 - 55, Edificio San Martín",
    telefono: "(601) 307 70 22",
    horario: "Lunes a Sábado: 6:00 AM - 8:00 PM"
  },
  {
    region: "Regional Centro Oriente",
    direccion: "Calle 35 # 18 - 21, Bucaramanga",
    telefono: "(607) 633 80 00",
    horario: "Lunes a Viernes: 7:00 AM - 6:00 PM"
  },
  {
    region: "Regional Noroccidente",
    direccion: "Calle 50 # 52 - 10, Medellín",
    telefono: "(604) 200 50 00",
    horario: "Lunes a Viernes: 7:00 AM - 5:00 PM"
  },
  {
    region: "Regional Caribe",
    direccion: "Carrera 54 # 72 - 142, Barranquilla",
    telefono: "(605) 385 50 00",
    horario: "Lunes a Viernes: 7:00 AM - 5:00 PM"
  }
];

const Sedes = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="sedes-page">
      
      {/* --- NAVBAR (Igual a la de Sobre Nosotros) --- */}
      <nav className="modern-navbar-dark">
        <div className="nav-links">
          <Link to="/">INICIO</Link>
          <Link to="/sobre-nosotros">SOBRE NOSOTROS</Link>
          <Link to="/sedes" className="active">SEDES</Link>
          <Link to="#">CONTACTO</Link>
        </div>
        <div className="nav-actions">
          <button className="nav-pill-btn help">AYUDA</button>
          <Link to="/login" className="nav-pill-btn login">LOGIN</Link>
        </div>
      </nav>

      {/* --- SECCIÓN 1: ENCABEZADO CON FONDO --- */}
      <header className="sedes-header">
        <div className="sedes-header-content">
          <div className="header-card">
            <h1>Sedes Administrativas</h1>
          </div>
        </div>
      </header>

      <div className="main-content-wrapper">
        
        {/* --- SECCIÓN 2: TÍTULO Y ACORDEONES --- */}
        <section className="sedes-list-section">
          <h2 className="sedes-intro-title">Contacta la sede regional o zonal más cercana a tus necesidades:</h2>
          
          <div className="accordion-container">
            {sedesData.map((sede, index) => (
              <div key={index} className={`accordion-item ${openIndex === index ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                  <h3>{sede.region}</h3>
                  <span className="accordion-icon">{openIndex === index ? '−' : '+'}</span>
                </div>
                {openIndex === index && (
                  <div className="accordion-body">
                    <div className="sede-details">
                      <p><strong>Dirección:</strong> {sede.direccion}</p>
                      <p><strong>Teléfono:</strong> {sede.telefono}</p>
                      <p><strong>Horario de Atención:</strong> {sede.horario}</p>
                      <button className="btn-mapa">Ver en Mapa</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
      
      {/* Botón flotante de ayuda (similar a la imagen) */}
      <div className="floating-help-btn">
        <div className="help-icon">💬</div>
        <span>CANALES<br/>DE SERVICIO</span>
      </div>

    </div>
  );
};

export default Sedes;