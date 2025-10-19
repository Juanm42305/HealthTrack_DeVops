// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/DashboardDispatcher.jsx

import React from 'react';
import { Navigate } from 'react-router-dom'; // Usaremos Navigate para redirigir
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
// Ya no necesitamos importar UserDashboard o DoctorDashboard aquí

function DashboardDispatcher() {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando...</div>;
  }

  // Decidimos qué mostrar o a dónde redirigir
  switch (user.role) {
    case 'usuario':
      // ¡CAMBIO CLAVE! Si es usuario, lo redirigimos a su nueva ruta
      return <Navigate to="/user/dashboard" replace />; 
    case 'medico':
      // (Aquí iría la redirección al dashboard del médico en el futuro)
      return <Navigate to="/doctor/dashboard" replace />;
    case 'administrador':
      // Si es admin, mostramos el dashboard de admin directamente
      return <AdminDashboard />;
    default:
      return <div>Rol no reconocido.</div>;
  }
}

export default DashboardDispatcher;