// Contenido completo para frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Ahora guardaremos el objeto 'user' completo, o 'null' si no ha iniciado sesión.
  const [user, setUser] = useState(null);

  // La función de login ahora aceptará los datos del usuario.
  const login = (userData) => {
    setUser(userData);
  };

  // La función de logout limpiará los datos del usuario.
  const logout = () => {
    setUser(null);
  };

  // 'isAuthenticated' ahora será 'true' si 'user' no es nulo.
  const isAuthenticated = !!user;

  // Compartimos el 'user' completo, además de las otras variables.
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Este hook no cambia, pero ahora nos dará acceso al 'user' completo.
export const useAuth = () => {
  return useContext(AuthContext);
};