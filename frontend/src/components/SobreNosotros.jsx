// Contenido para frontend/src/components/SobreNosotros.jsx

import React from 'react';
import './SobreNosotros.css'; // Importa el nuevo CSS

// Importa las imágenes
import quienesSomosBanner from '../assets/quienes-somos-banner.jpg'; // Imagen del banner (mujer sonriendo)
import nuestraMisionImg from '../assets/nuestra-mision.jpg';       // Imagen para la sección Misión
import nuestraVisionImg from '../assets/nuestra-vision.jpg';       // Imagen para la sección Visión
import nuestrosValoresImg from '../assets/nuestros-valores.jpg';   // Imagen para la sección Valores
import contactoCallToAction from '../assets/contact-call-to-action.jpg'; // Imagen para el CTA de contacto

const SobreNosotros = () => {
  return (
    <div className="sobre-nosotros-page">
      {/* Sección 1: Banner Principal "¿Quiénes Somos?" */}
      <section className="quienes-somos-banner">
        <div className="banner-overlay">
          <div className="banner-content">
            <h1 className="banner-title">Quiénes Somos</h1>
            <p className="banner-subtitle">
              Conoce más sobre HealthTrack, nuestra misión y los valores que nos impulsan.
            </p>
          </div>
        </div>
        <img src={quienesSomosBanner} alt="Profesional de la salud sonriendo" className="banner-image" />
      </section>

      {/* Sección 2: Introducción detallada (similar a la imagen que enviaste) */}
      <section className="intro-section content-container">
        <h2 className="section-heading">NUEVA EPS</h2>
        <p>
          NUEVA EPS es una sociedad anónima constituida mediante la escritura pública No. 753 del 22 de marzo de 2007, 
          que surge como Entidad Promotora de Salud del Régimen Contributivo a través de la{' '}
          <a href="#" className="inline-link">Resolución No. 371 del 3 de abril de 2008</a> y del Régimen Subsidiado 
          a través de la <a href="#" className="inline-link">Resolución No. 02664 del 17 de diciembre de 2015</a> de la 
          Superintendencia Nacional de Salud.
        </p>
        <p>
          NUEVA EPS inició operaciones el 1 de agosto de 2008 con los afiliados del Instituto de Seguros Sociales (ISS) 
          que fueron trasladados a la Compañía.
        </p>
        <p>
          NUEVA EPS ha logrado crecer en usuarios convirtiéndose en una de las EPS más grandes del país y la primera 
          en cobertura con presencia en 1.117 municipios.
        </p>
      </section>

      {/* Sección 3: Misión, Visión, Valores (con imágenes al lado) */}
      <section className="mision-vision-valores content-container">
        <div className="mision-item item-left">
          <div className="item-text">
            <h2 className="section-heading">Misión</h2>
            <p>
              Ser la plataforma de salud líder en Colombia, brindando acceso fácil y seguro 
              a servicios médicos de calidad, promoviendo el bienestar y la prevención a 
              través de la tecnología.
            </p>
          </div>
          <div className="item-image-wrapper">
            <img src={nuestraMisionImg} alt="Misión de HealthTrack" className="item-image" />
          </div>
        </div>

        <div className="vision-item item-right">
          <div className="item-image-wrapper">
            <img src={nuestraVisionImg} alt="Visión de HealthTrack" className="item-image" />
          </div>
          <div className="item-text">
            <h2 className="section-heading">Visión</h2>
            <p>
              Revolucionar la experiencia de atención médica, empoderando a pacientes y 
              profesionales con herramientas innovadoras que optimizan la gestión de la salud, 
              fomentando una comunidad saludable y conectada.
            </p>
          </div>
        </div>

        <div className="valores-item item-left">
          <div className="item-text">
            <h2 className="section-heading">Valores</h2>
            <ul>
              <li><i className="fas fa-heartbeat"></i> Humanidad y Empatía</li>
              <li><i className="fas fa-shield-alt"></i> Seguridad y Confidencialidad</li>
              <li><i className="fas fa-lightbulb"></i> Innovación Constante</li>
              <li><i className="fas fa-handshake"></i> Compromiso con la Calidad</li>
              <li><i className="fas fa-users"></i> Colaboración y Trabajo en Equipo</li>
            </ul>
          </div>
          <div className="item-image-wrapper">
            <img src={nuestrosValoresImg} alt="Valores de HealthTrack" className="item-image" />
          </div>
        </div>
      </section>

      {/* Sección 4: Llamada a la Acción de Contacto */}
      <section className="call-to-action-section">
        <div className="cta-overlay">
          <div className="cta-content">
            <h2 className="cta-title">¿Necesitas Ayuda o Tienes Preguntas?</h2>
            <p className="cta-description">
              Nuestro equipo está listo para asistirte. Ponte en contacto con nosotros.
            </p>
            <button className="cta-button" onClick={() => console.log('Ir a Contacto')}>
              Contactar Ahora
            </button>
          </div>
        </div>
        <img src={contactoCallToAction} alt="Contactar HealthTrack" className="cta-image" />
      </section>
    </div>
  );
};

export default SobreNosotros;