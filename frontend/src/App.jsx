// Contenido COMPLETO y LIMPIO para frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componentes de Vistas
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardDispatcher from './components/DashboardDispatcher';
import Profile from './components/Profile';
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
import AgendarCita from './components/AgendarCita';
import MisCitas from './components/MisCitas';

// Componentes de Lógica y Seguridad
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // ¡LA BARRA DE NAVEGACIÓN GENÉRICA SE HA IDO!
  // Ahora, cada dashboard es responsable de su propio layout.
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas Privadas (el dispatcher decide qué dashboard mostrar) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardDispatcher />
          </ProtectedRoute>
        }
      />
      
      {/* Rutas de Usuario/Paciente */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/agendar-cita" element={<ProtectedRoute><AgendarCita /></ProtectedRoute>} />
      <Route path="/mis-citas" element={<ProtectedRoute><MisCitas /></ProtectedRoute>} />

      {/* Rutas del Administrador */}
      <Route path="/admin/gestion-medicos" element={<ProtectedRoute><GestionMedicos /></ProtectedRoute>} />
      <Route path="/admin/gestion-citas" element={<ProtectedRoute><GestionCitas /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;