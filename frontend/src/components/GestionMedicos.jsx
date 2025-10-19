// Contenido completo y a prueba de errores para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import './GestionMedicos.css';

function GestionMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Estado para guardar el mensaje de error

  useEffect(() => {
    const fetchMedicos = async () => {
      setLoading(true);
      setError(null); // Limpiamos errores anteriores
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log("Intentando conectar a esta URL:", `${apiUrl}/api/admin/doctors`);

      try {
        const response = await fetch(`${apiUrl}/api/admin/doctors`);
        
        if (!response.ok) {
          // Si la respuesta no es 200, guardamos el status del error
          throw new Error(`El servidor respondió con un error: ${response.status}`);
        }
        
        const data = await response.json();
        setMedicos(data);

      } catch (err) {
        console.error("Error al obtener médicos:", err.message);
        setError(err.message); // Guardamos el mensaje de error para mostrarlo en pantalla
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []); // El array vacío asegura que solo se ejecute una vez al cargar

  // --- RENDERIZADO CONDICIONAL ---
  
  if (loading) {
    return <div className="loading">Cargando médicos...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>❌ Ocurrió un Error</h2>
        <p>No se pudo cargar la lista de médicos.</p>
        <pre>Detalle técnico: {error}</pre>
        <p>Por favor, revisa los logs de tu backend en Render para más detalles.</p>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      <h1>Gestión de Médicos</h1>
      {/* ... (El resto de tu tabla sigue igual) ... */}
    </div>
  );
}

export default GestionMedicos;