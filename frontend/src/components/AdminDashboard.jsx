// Contenido completo y actualizado para frontend/src/components/AdminDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaFileInvoiceDollar, FaFlask } from 'react-icons/fa'; // Iconos
import { useMedicos } from '../context/MedicoContext'; // <-- ¡NUEVO! Importamos el cerebro de médicos
import './AdminDashboard.css';

function AdminDashboard() {
  // Obtenemos la función para refrescar la lista de médicos desde el cerebro
  const { fetchMedicos } = useMedicos();

  const handleAddDoctor = async () => {
    // Pedimos los datos al administrador usando prompts simples
    const username = prompt("Ingresa el nombre de usuario para el nuevo médico:");
    const password = prompt("Ingresa la contraseña temporal para el nuevo médico:");

    if (!username || !password) {
      alert("El usuario y la contraseña no pueden estar vacíos.");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/admin/add-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // En el futuro, aquí se enviaría un token de autenticación del admin
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        alert(`✅ Médico "${username}" creado exitosamente.`);
        // ¡CAMBIO CLAVE! Le decimos al cerebro que se actualice con la nueva lista de médicos
        fetchMedicos(); 
      } else {
        const errorData = await response.json();
        alert(`Error al crear el médico: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al intentar crear el médico.");
    }
  };

  return (
    // El resto de tu código JSX sigue exactamente igual.
    <div className="admin-dashboard">
      
      {/* 1. Barra Lateral de Navegación */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin/gestion-medicos"><FaUserMd /> Gestión de Médicos</Link></li>
            <li><Link to="/admin/gestion-citas"><FaCalendarAlt /> Gestión de Citas</Link></li>
            <li><Link to="/admin/facturacion"><FaFileInvoiceDollar /> Facturación y Reportes</Link></li>
            <li><Link to="/admin/laboratorio"><FaFlask /> Módulo de Laboratorio</Link></li>
          </ul>
        </nav>
      </aside>

      {/* 2. Área de Contenido Principal */}
      <main className="main-content">
        <header className="main-header">
          <h1>Panel de Administrador</h1>
          <p>Bienvenido, aquí puedes gestionar toda la plataforma.</p>
        </header>

        <div className="widget-grid">
          
          <div className="widget">
            <FaUserMd className="widget-icon" />
            <h3>Añadir Nuevo Médico</h3>
            <p>Crea las credenciales y el perfil para un nuevo especialista.</p>
            <button onClick={handleAddDoctor}>Añadir Médico</button>
          </div>

          <div className="widget">
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
      </main>
    </div>
  );
}

export default AdminDashboard;