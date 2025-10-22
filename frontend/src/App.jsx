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
import UserLayout from './components/UserLayout'; // <-- ¡IMPORTAMOS LA PLANTILLA DE USUARIO!
import Facturacion from './components/Facturacion'; // <-- ¡NUEVO!

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
        {/* <Route index element={<AdminHome />} />  // Esto mostrará los widgets */}
        <Route path="gestion-medicos" element={<GestionMedicos />} />
        <Route path="gestion-citas" element={<GestionCitas />} />
        <Route path="facturacion" element={<Facturacion />} />
      </Route>

      {/* --- ¡NUEVA LÓGICA DE RUTAS DE USUARIO! --- */}
      {/* Todas las rutas del usuario ahora viven DENTRO de la plantilla UserLayout */}
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