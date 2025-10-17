// Contenido para frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Estado para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para "iniciar sesión"
  const login = () => {
    setIsAuthenticated(true);
  };

  // Función para "cerrar sesión"
  const logout = () => {
    setIsAuthenticated(false);
    // Opcional: limpiar tokens o datos del usuario aquí
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Un "hook" personalizado para usar el contexto fácilmente en otros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};