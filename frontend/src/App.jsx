// Contenido completo y actualizado para frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

// Componentes de Vistas
import Login from './components/Login';
import Register from './components/Register';
import DashboardDispatcher from './components/DashboardDispatcher';
import Profile from './components/Profile';
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
import AgendarCita from './components/AgendarCita';
import MisCitas from './components/MisCitas'; // <-- ¡NUEVO! Se importa la página de "Mis Citas"

// Componentes de Lógica y Seguridad
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* --- Menú de Navegación Inteligente (Solo para usuarios logueados) --- */}
      {isAuthenticated && (
        <nav style={{ padding: '1rem', background: '#333', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/profile" style={{ color: 'white', marginRight: '1rem' }}>Perfil</Link>
          <Link to="/mis-citas" style={{ color: 'white', marginRight: '1rem' }}>Mis Citas</Link> {/* <-- ¡NUEVO ENLACE! */}
          <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Cerrar Sesión</button>
        </nav>
      )}

      {/* --- Definición de todas las rutas de la aplicación --- */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Privadas Comunes (Protegidas) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardDispatcher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas de Usuario/Paciente (Protegidas) */}
        <Route
          path="/agendar-cita"
          element={
            <ProtectedRoute>
              <AgendarCita />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-citas"
          element={
            <ProtectedRoute>
              <MisCitas />
            </ProtectedRoute>
          }
        />

        {/* Rutas del Administrador (Protegidas) */}
        <Route
          path="/admin/gestion-medicos"
          element={
            <ProtectedRoute>
              <GestionMedicos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gestion-citas"
          element={
            <ProtectedRoute>
              <GestionCitas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;