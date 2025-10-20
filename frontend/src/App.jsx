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
import AdminDashboard from './components/AdminDashboard'; // Importamos el layout del Admin
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';

// Lógica
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta del Dispatcher (decide qué dashboard mostrar) */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>}
      />
      
      {/* --- ¡NUEVA LÓGICA DE RUTAS DE ADMIN! --- */}
      {/* Todas las rutas del admin ahora viven DENTRO de la plantilla AdminDashboard */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
        {/* La ruta "índice" del admin mostrará los widgets (necesitamos un componente para esto) */}
        {/* <Route index element={<AdminHome />} />  // Lo haremos en el futuro */}
        <Route path="gestion-medicos" element={<GestionMedicos />} />
        <Route path="gestion-citas" element={<GestionCitas />} />
        {/* Aquí irán las otras rutas del admin como "facturacion", etc. */}
      </Route>

      {/* Rutas de Usuario/Paciente (siguen igual) */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/agendar-cita" element={<ProtectedRoute><AgendarCita /></ProtectedRoute>} />
      <Route path="/mis-citas" element={<ProtectedRoute><MisCitas /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;