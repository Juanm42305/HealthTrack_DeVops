// Contenido COMPLETO y ACTUALIZADO para frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Vistas Públicas
import WelcomePage from './components/WelcomePage'; // Ahora es el Layout
import Login from './components/Login';
import Register from './components/Register';

// Vistas Protegidas y Layouts
import ProtectedRoute from './context/ProtectedRoute';
import DashboardDispatcher from './components/DashboardDispatcher';

// --- Layouts ---
import AdminDashboard from './components/AdminDashboard';
import UserLayout from './components/UserLayout';
import DoctorLayout from './components/DoctorLayout';

// --- Páginas de Admin ---
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
// import Facturacion from './components/Facturacion'; // Si existe

// --- Páginas de Usuario ---
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile'; // Componente reutilizable
import MisCitas from './components/MisCitas';
import AgendarCita from './components/AgendarCita';

// --- Páginas de Médico ---
import DoctorDashboard from './components/DoctorDashboard';
import DoctorCitas from './components/DoctorCitas';
import DoctorHistoriales from './components/DoctorHistoriales'; 
import DoctorDiagnosticos from './components/DoctorDiagnosticos';
import DoctorResultados from './components/DoctorResultados';
import DoctorPatients from './components/DoctorPatients';


function App() {
  return (
    <Routes>
      {/* --- RUTA PÚBLICA / LAYOUT DE AUTENTICACIÓN --- */}
      {/* WelcomePage actúa como un layout que proporciona el fondo. */}
      <Route path="/" element={<WelcomePage />}> 
          {/* Si path es "/", WelcomePage muestra su contenido principal */}
          
          {/* Rutas Anidadas: Se mostrarán DENTRO del Outlet de WelcomePage */}
          {/* Estas rutas se superpondrán al fondo de WelcomePage */}
          <Route path="login" element={<Login />} /> 
          <Route path="register" element={<Register />} /> 
      </Route>

      {/* Ruta del Dispatcher */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>}
      />

      {/* Rutas de Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
        <Route path="gestion-medicos" element={<GestionMedicos />} />
        <Route path="gestion-citas" element={<GestionCitas />} />
        {/* <Route path="facturacion" element={<Facturacion />} /> */}
      </Route>

      {/* Rutas de Usuario */}
      <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<Profile />} /> 
        <Route path="mis-citas" element={<MisCitas />} />
        <Route path="agendar-cita" element={<AgendarCita />} />
      </Route>

      {/* Rutas de Médico */}
      <Route path="/doctor" element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<Profile />} /> 
        <Route path="citas" element={<DoctorCitas />} />
        <Route path="pacientes" element={<DoctorPatients />} /> 
        {/* Rutas de Historiales */}
        <Route path="pacientes/:patientId/historiales" element={<DoctorHistoriales />} /> 
        <Route path="historiales" element={<DoctorHistoriales />} /> 
        <Route path="diagnosticos" element={<DoctorDiagnosticos />} />
        <Route path="resultados" element={<DoctorResultados />} />
      </Route>

    </Routes>
  );
}

export default App;