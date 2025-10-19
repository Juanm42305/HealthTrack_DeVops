// Contenido para frontend/src/context/MedicoContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const MedicoContext = createContext(null);

export const MedicoProvider = ({ children }) => {
  const [medicos, setMedicos] = useState([]);

  // Función para cargar o refrescar la lista de médicos desde el backend
  const fetchMedicos = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/doctors`);
      if (response.ok) {
        const data = await response.json();
        setMedicos(data);
      }
    } catch (error) {
      console.error("Error al cargar médicos:", error);
    }
  }, []);

  return (
    <MedicoContext.Provider value={{ medicos, fetchMedicos }}>
      {children}
    </MedicoContext.Provider>
  );
};

// Hook para usar este cerebro fácilmente
export const useMedicos = () => {
  return useContext(MedicoContext);
};