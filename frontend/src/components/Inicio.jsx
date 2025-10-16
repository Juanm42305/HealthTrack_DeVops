import React from "react";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaFileMedical,
  FaHeartbeat,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Inicio.css";

function Inicio({ username, onLogout }) {
  return (
    <div className="inicio-container">
      {/* Encabezado */}
      <header className="inicio-header">
        <div className="logo">💙 HealthTrack</div>
        <nav className="nav-links">
          <a href="#">Inicio</a>
          <a href="#">Citas Médicas</a>
          <a href="#">Resultados</a>
          <a href="#">Contacto</a>
        </nav>
        <div className="user-info">
          <FaUserCircle size={30} />
          <span>{username}</span>
        </div>
      </header>

      {/* Banner */}
      <section className="inicio-banner">
        <h1>Bienvenido, {username} 👋</h1>
        <p>
          Administra tus citas, consulta tus resultados y cuida tu bienestar con{" "}
          <strong>HealthTrack</strong>.
        </p>
      </section>

      {/* Secciones principales */}
      <main className="inicio-main">
        <div className="card">
          <FaCalendarAlt size={40} />
          <h3>Agendar Cita</h3>
          <p>Programa tus citas médicas fácilmente con especialistas disponibles.</p>
          <button>Ir</button>
        </div>
        <div className="card">
          <FaFileMedical size={40} />
          <h3>Resultados</h3>
          <p>Consulta tus exámenes y reportes clínicos de manera segura.</p>
          <button>Ver</button>
        </div>
        <div className="card">
          <FaHeartbeat size={40} />
          <h3>Mi Salud</h3>
          <p>Monitorea tus signos vitales y hábitos saludables.</p>
          <button>Acceder</button>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="inicio-footer">
        <p>© 2025 HealthTrack. Todos los derechos reservados.</p>
        <button className="logout-btn" onClick={onLogout}>
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </footer>
    </div>
  );
}

export default Inicio;
