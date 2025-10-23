// Contenido COMPLETO para frontend/src/context/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Asegúrate de que AuthContext.jsx esté en esta misma carpeta

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); 

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirigimos a la página de login
    return <Navigate to="/" />;
  }

  // Si está autenticado, le mostramos la página que pidió
  return children;
};

export default ProtectedRoute;