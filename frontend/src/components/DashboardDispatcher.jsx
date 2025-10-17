// Contenido para frontend/src/components/DashboardDispatcher.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserDashboard from './UserDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

function DashboardDispatcher() {
  const { user } = useAuth(); // Obtenemos la información del usuario logueado

  if (!user) {
    // Muestra un mensaje de carga mientras se obtiene la info del usuario
    return <div>Cargando...</div>;
  }

  // Decidimos qué dashboard mostrar basado en el rol del usuario
  switch (user.role) {
    case 'usuario':
      return <UserDashboard />;
    case 'medico':
      return <DoctorDashboard />;
    case 'administrador':
      return <AdminDashboard />;
    default:
      // Si el rol es desconocido, lo mandamos a una página de error o al login
      return <div>Rol no reconocido.</div>;
  }
}

export default DashboardDispatcher;