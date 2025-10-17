// Contenido para frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos nuestro hook

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Obtenemos el estado de autenticación

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirigimos a la página de login
    return <Navigate to="/" />;
  }

  // Si está autenticado, le mostramos la página que pidió
  return children;
};

export default ProtectedRoute;