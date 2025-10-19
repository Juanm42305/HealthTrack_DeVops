// Contenido completo y limpio para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import './GestionMedicos.css';

function GestionMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicos = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log("Intentando conectar a esta URL:", `${apiUrl}/api/admin/doctors`);

      try {
        const response = await fetch(`${apiUrl}/api/admin/doctors`);
        if (response.ok) {
          const data = await response.json();
          setMedicos(data);
        } else {
          console.error("Error en la respuesta del servidor:", response.status);
          alert("No se pudo cargar la lista de médicos. El servidor respondió con un error.");
        }
      } catch (error) {
        console.error("Error de red:", error);
        alert("Error de conexión. Asegúrate de que el backend esté funcionando y la URL en Vercel sea correcta.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []); // El array vacío asegura que solo se ejecute una vez al cargar

  if (loading) {
    return <div className="loading">Cargando médicos...</div>;
  }

  return (
    <div className="gestion-container">
      <h1>Gestión de Médicos</h1>
      <p>Aquí puedes ver y editar la información de los especialistas.</p>

      <table className="medicos-table">
        <thead>
          <tr>
            <th>Usuario (Login)</th>
            <th>Nombre Completo</th>
            <th>Especialidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos.length > 0 ? (
            medicos.map((medico) => (
              <tr key={medico.user_id}>
                <td>{medico.username}</td>
                <td>{`${medico.nombres || ''} ${medico.primer_apellido || ''}`}</td>
                <td>{medico.especialidad || 'No asignada'}</td>
                <td>
                  <button className="edit-btn">Editar</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No hay médicos registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default GestionMedicos;