// Contenido COMPLETO y DEFINITIVO para frontend/src/App.jsx (CON ANALYTICS Y SPEED INSIGHTS)
// (Y LAS NUEVAS RUTAS DE LABORATORIO/RESULTADOS)

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';           // <-- 1. Analytics
import { SpeedInsights } from '@vercel/speed-insights/react'; // <-- 2. SPEED INSIGHTS (Importación correcta)

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
import DoctorLayout from './components/DoctorLayout';

// --- Páginas de Admin ---
import GestionMedicos from './components/GestionMedicos';
import GestionCitas from './components/GestionCitas';
import GestionLaboratorio from './components/GestionLaboratorio'; // <-- ¡NUEVO ADMIN!
// import Facturacion from './components/Facturacion';

// --- Páginas de Usuario ---
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile';
import MisCitas from './components/MisCitas';
import AgendarCita from './components/AgendarCita';
import MisResultados from './components/MisResultados'; // <-- ¡NUEVO USUARIO!

// --- Páginas de Médico ---
import DoctorDashboard from './components/DoctorDashboard';
import DoctorCitas from './components/DoctorCitas';
import DoctorHistoriales from './components/DoctorHistoriales';
import DoctorDiagnosticos from './components/DoctorDiagnosticos';
import DoctorResultados from './components/DoctorResultados'; // <-- (Ya existía, ahora es funcional)
import DoctorPatients from './components/DoctorPatients';


function App() {
  return (
    <>
      <Routes>
        {/* ... (Todas tus rutas <Route ... /> van aquí) ... */}
        
        {/* --- RUTA PÚBLICA / LAYOUT DE AUTENTICACIÓN --- */}
        <Route path="/" element={<WelcomePage />}>
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
          <Route path="laboratorio" element={<GestionLaboratorio />} /> {/* <-- ¡RUTA NUEVA ADMIN! */}
          {/* <Route path="facturacion" element={<Facturacion />} /> */}
        </Route>

        {/* Rutas de Usuario */}
        <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="mis-citas" element={<MisCitas />} />
          <Route path="agendar-cita" element={<AgendarCita />} />
          <Route path="resultados" element={<MisResultados />} /> {/* <-- ¡RUTA NUEVA USUARIO! */}
        </Route>

        {/* Rutas de Médico */}
        <Route path="/doctor" element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="citas" element={<DoctorCitas />} />
          <Route path="pacientes" element={<DoctorPatients />} />
          <Route path="pacientes/:patientId/historiales" element={<DoctorHistoriales />} />
          <Route path="historiales" element={<DoctorHistoriales />} />
          <Route path="diagnosticos" element={<DoctorDiagnosticos />} />
          {/* --- ¡RUTA MODIFICADA MÉDICO! --- */}
          <Route path="pacientes/:patientId/resultados" element={<DoctorResultados />} />
        </Route>

      </Routes>
      
      <Analytics />       {/* <-- Componente de Analytics */}
      <SpeedInsights /> {/* <-- 3. AÑADE EL COMPONENTE AQUÍ */}
    </>
  );
}

export default App;

// RE-SYNC ANALYTICS