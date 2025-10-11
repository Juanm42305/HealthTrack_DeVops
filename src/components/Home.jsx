import React from "react";
import "../styles/home.css";

function Home() {
  return (
    <div className="home">
      <header className="navbar">
        <h2>HealthTrack</h2>
        <nav>
          <a href="#">Inicio</a>
          <a href="#">Servicios</a>
          <a href="#">Citas Médicas</a>
          <a href="#">Contacto</a>
        </nav>
      </header>

      <section className="banner">
        <h1>Bienvenido a HealthTrack</h1>
        <p>Accede a tus servicios médicos de forma rápida y segura.</p>
        <button>Solicitar Cita</button>
      </section>

      <section className="cards">
        <div className="card">
          <h3>📅 Citas Médicas</h3>
          <p>Programa, consulta y administra tus citas fácilmente.</p>
        </div>
        <div className="card">
          <h3>🧾 Historia Clínica</h3>
          <p>Accede a tu historial médico de manera confidencial.</p>
        </div>
        <div className="card">
          <h3>📍 Directorio</h3>
          <p>Encuentra nuestras sedes y puntos de atención.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 HealthTrack - Todos los derechos reservados</p>
      </footer>
    </div>
  );
}

export default Home;
