// Contenido COMPLETO y ACTUALIZADO para frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Vistas Públicas
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Register from './components/Register';

// Vistas Protegidas y Layouts
import ProtectedRoute from './context/ProtectedRoute';
import DashboardDispatcher from './components/DashboardDispatcher';

// --- Layouts ---
import AdminDashboard from './components/AdminDashboard';
import UserLayout from './components/UserLayout'; 
import DoctorLayout from './components/DoctorLayout'; // ¡NUEVO!

// --- Páginas de Admin ---
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
// (Importa Facturacion, Laboratorio, etc. si las tienes)

// --- Páginas de Usuario ---
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile'; // Componente reutilizable
import MisCitas from './components/MisCitas';
import AgendarCita from './components/AgendarCita';

// --- ¡NUEVAS PÁGINAS DE MÉDICO! ---
import DoctorDashboard from './components/DoctorDashboard';
import DoctorCitas from './components/DoctorCitas';
import DoctorPacientes from './components/DoctorPacientes';
import DoctorHistoriales from './components/DoctorHistoriales';
import DoctorDiagnosticos from './components/DoctorDiagnosticos';
import DoctorResultados from './components/DoctorResultados';


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
        {/* <Route index element={<AdminHome />} />  // (La ruta base /admin la maneja AdminDashboard) */}
        <Route path="gestion-medicos" element={<GestionMedicos />} />
        <Route path="gestion-citas" element={<GestionCitas />} />
        {/* (Aquí tus otras rutas: "facturacion", "laboratorio") */}
      </Route>

      {/* --- LÓGICA DE RUTAS DE USUARIO (Anidadas) --- */}
      <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="mis-citas" element={<MisCitas />} />
        <Route path="agendar-cita" element={<AgendarCita />} />
      </Route>

      {/* --- ¡NUEVO GRUPO DE RUTAS DE MÉDICO! --- */}
      <Route path="/doctor" element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<Profile />} /> {/* Reutilizamos Profile */}
        <Route path="citas" element={<DoctorCitas />} />
        <Route path="pacientes" element={<DoctorPacientes />} />
        <Route path="historiales" element={<DoctorHistoriales />} />
        <Route path="diagnosticos" element={<DoctorDiagnosticos />} />
        <Route path="resultados" element={<DoctorResultados />} />
      </Route>

    </Routes>
  );
}

export default App;