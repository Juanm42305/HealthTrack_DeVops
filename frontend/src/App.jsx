// Contenido COMPLETO y DEFINITIVO para frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Vistas Públicas
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Register from './components/Register';
import SobreNosotros from './components/SobreNosotros';
import Sedes from './components/Sedes';
import Contacto from './components/Contacto'; // <-- IMPORTAR AQUÍ

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
import GestionLaboratorio from './components/GestionLaboratorio';
import Facturacion from './components/Facturacion';
import AdminReportes from './components/AdminReportes';
// --- Páginas de Usuario ---
import UserDashboard from './components/UserDashboard';
import Profile from './components/Profile';
import MisCitas from './components/MisCitas';
import AgendarCita from './components/AgendarCita';
import MisResultados from './components/MisResultados';
import MisFacturas from './components/MisFacturas';
import MisDiagnosticos from './components/MisDiagnosticos';

// --- Páginas de Médico ---
import DoctorDashboard from './components/DoctorDashboard';
import DoctorCitas from './components/DoctorCitas';
import DoctorHistoriales from './components/DoctorHistoriales';
import DoctorDiagnosticos from './components/DoctorDiagnosticos';
import DoctorResultados from './components/DoctorResultados'; 
import DoctorPatients from './components/DoctorPatients';


function App() {
  return (
    <>
      <Routes>
        
        {/* --- RUTA PÚBLICA / LAYOUT DE AUTENTICACIÓN --- */}
        <Route path="/" element={<WelcomePage />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* --- NUEVAS RUTAS PÚBLICAS --- */}
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/sedes" element={<Sedes />} />
        <Route path="/contacto" element={<Contacto />} /> {/* <-- NUEVA RUTA */}

        {/* Ruta del Dispatcher */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>}
        />

        {/* Rutas de Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}>
          <Route path="gestion-medicos" element={<GestionMedicos />} />
          <Route path="gestion-citas" element={<GestionCitas />} />
          <Route path="laboratorio" element={<GestionLaboratorio />} />
          <Route path="facturacion" element={<Facturacion />} />
          <Route path="reportes" element={<AdminReportes />} />
        </Route>

        {/* Rutas de Usuario */}
        <Route path="/user" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="mis-citas" element={<MisCitas />} />
          <Route path="agendar-cita" element={<AgendarCita />} />
          <Route path="resultados" element={<MisResultados />} />
          <Route path="mis-facturas" element={<MisFacturas />} />
          <Route path="mis-diagnosticos" element={<MisDiagnosticos />} />
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
          <Route path="resultados" element={<DoctorResultados />} />
          <Route path="pacientes/:patientId/resultados" element={<DoctorResultados />} />
        </Route>

      </Routes>
      
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;