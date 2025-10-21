// Contenido COMPLETO y CONVERTIDO A LAYOUT para frontend/src/components/AdminDashboard.jsx

import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'; // <-- ¡IMPORTAMOS OUTLET y useLocation!
import { useAuth } from '../context/AuthContext';
import { FaTachometerAlt, FaUserMd, FaCalendarAlt, FaFileInvoiceDollar, FaFlask, FaSignOutAlt } from 'react-icons/fa';
import { useMedicos } from '../context/MedicoContext'; // Asumiendo que MedicoContext está disponible
import './AdminDashboard.css';

// --- ¡NUEVO! Componente para la página principal del dashboard ---
// Esto es lo que se mostrará en la ruta "/dashboard" del admin
function AdminHome() {
  const navigate = useNavigate();
  const { fetchMedicos } = useMedicos();

  const handleAddDoctor = async () => {
    const username = prompt("Ingresa el nombre de usuario para el nuevo médico (SOLO LETRAS):");
    const password = prompt("Ingresa la contraseña numérica temporal (SOLO NÚMEROS):");

    if (!username || !password) return alert("Ambos campos son requeridos.");
    if (!/^[A-Za-z]+$/.test(username)) return alert("El nombre de usuario solo puede contener letras.");
    if (!/^[0-9]+$/.test(password)) return alert("La contraseña solo puede contener números.");

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/add-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert(`✅ Médico "${username}" creado exitosamente.`);
        if (fetchMedicos) fetchMedicos();
      } else {
        const errorData = await response.json();
        alert(`Error al crear el médico: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error de red al intentar crear el médico.");
    }
  };
  
  return (
    <>
      <header className="main-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido, aquí puedes gestionar toda la plataforma.</p>
      </header>
      <div className="widget-grid">
        <div className="widget" onClick={handleAddDoctor}>
          <FaUserMd className="widget-icon" />
          <h3>Añadir Nuevo Médico</h3>
          <p>Crea las credenciales y el perfil para un nuevo especialista.</p>
          <button>Añadir Médico</button>
        </div>
        <div className="widget" onClick={() => navigate('/admin/gestion-citas')}>
          <FaCalendarAlt className="widget-icon" />
          <h3>Programar Citas</h3>
          <p>Habilita nuevas fechas y horarios en el calendario de citas.</p>
          <button>Programar Agenda</button>
        </div>
        <div className="widget">
          <FaFileInvoiceDollar className="widget-icon" />
          <h3>Ver Facturación</h3>
          <p>Consulta los reportes de pagos y facturas generadas.</p>
          <button>Ver Reportes</button>
        </div>
      </div>
    </>
  );
}


// --- Componente Principal del Layout del Admin ---
function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para saber en qué ruta estamos

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Función para determinar si un enlace está activo
  const isLinkActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-dashboard-layout">
      
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
        </div>
        <div className="sidebar-user-profile">
          <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
          <h3>{user?.username}</h3>
          <p>Administrador</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-link ${isLinkActive('/dashboard') ? 'active' : ''}`}><FaTachometerAlt /> <span>Dashboard</span></Link>
          <Link to="/admin/gestion-medicos" className={`nav-link ${isLinkActive('/admin/gestion-medicos') ? 'active' : ''}`}><FaUserMd /> <span>Gestión de Médicos</span></Link>
          <Link to="/admin/gestion-citas" className={`nav-link ${isLinkActive('/admin/gestion-citas') ? 'active' : ''}`}><FaCalendarAlt /> <span>Gestión de Citas</span></Link>
          <Link to="/admin/facturacion" className={`nav-link ${isLinkActive('/admin/facturacion') ? 'active' : ''}`}><FaFileInvoiceDollar /> <span>Facturación</span></Link>
          <Link to="/admin/laboratorio" className={`nav-link ${isLinkActive('/admin/laboratorio') ? 'active' : ''}`}><FaFlask /> <span>Laboratorio</span></Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button"><FaSignOutAlt /> <span>Cerrar Sesión</span></button>
        </div>
      </aside>

      <main className="admin-main-content">
        {/* --- ¡CAMBIO CLAVE! --- */}
        {/* Si estamos en la ruta exacta "/dashboard", mostramos los widgets. */}
        {/* Si no, Outlet se encarga de mostrar la página hija (ej: GestionMedicos) */}
        {location.pathname === '/dashboard' ? <AdminHome /> : <Outlet />}
      </main>
    </div>
  );
}

export default AdminDashboard;