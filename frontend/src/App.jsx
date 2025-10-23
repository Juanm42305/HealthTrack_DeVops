// Contenido COMPLETO y CORREGIDO para frontend/src/App.jsx

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
import AdminDashboard from './components/AdminDashboard';
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
import UserLayout from './components/UserLayout'; 

// Lógica
// --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
// La ruta correcta es './context/ProtectedRoute', no './components'
import ProtectedRoute from './context/ProtectedRoute'; 

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
      
      {/* --- LÓGICA DE RUTAS DE ADMIN (Anidadas) --- */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
        <Route path="gestion-medicos" element={<GestionMedicos />} />
        <Route path="gestion-citas" element={<GestionCitas />} />
        {/* Aquí irán las otras rutas del admin como "facturacion", etc. */}
      </Route>

      {/* --- LÓGICA DE RUTAS DE USUARIO (Anidadas) --- */}
      <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="mis-citas" element={<MisCitas />} />
        <Route path="agendar-cita" element={<AgendarCita />} />
      </Route>
    </Routes>
  );
}

export default App;