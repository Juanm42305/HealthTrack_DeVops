// Contenido COMPLETO y REESTRUCTURADO para frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Vistas
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardDispatcher from './components/DashboardDispatcher';
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile';
import MisCitas from './components/MisCitas';
import AgendarCita from './components/AgendarCita';
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
import UserLayout from './components/UserLayout'; // <-- ¡IMPORTAMOS LA NUEVA PLANTILLA!

// Lógica
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta del Dispatcher (decide si mostrar Admin o la plantilla de Usuario) */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>}
      />
      
      {/* --- ¡NUEVA LÓGICA DE RUTAS DE USUARIO! --- */}
      {/* Todas las rutas del usuario ahora viven DENTRO de la plantilla UserLayout */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mis-citas" element={<MisCitas />} />
        <Route path="/agendar-cita" element={<AgendarCita />} />
      </Route>

      {/* Rutas del Administrador (siguen igual) */}
      <Route path="/admin/gestion-medicos" element={<ProtectedRoute><GestionMedicos /></ProtectedRoute>} />
      <Route path="/admin/gestion-citas" element={<ProtectedRoute><GestionCitas /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;