// Contenido para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import './GestionMedicos.css'; // Importamos el CSS

function GestionMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect se ejecuta una vez cuando el componente se carga
  useEffect(() => {
    const fetchMedicos = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/admin/doctors`);
        if (response.ok) {
          const data = await response.json();
          setMedicos(data);
        } else {
          console.error("Error al obtener los médicos");
        }
      } catch (error) {
        console.error("Error de red:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
  }, []); // El array vacío asegura que solo se ejecute una vez

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
            <th>Consultorio</th>
            <th>Sede</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos.map((medico) => (
            <tr key={medico.user_id}>
              <td>{medico.username}</td>
              <td>{`${medico.nombres || ''} ${medico.primer_apellido || ''}`}</td>
              <td>{medico.especialidad || 'No asignada'}</td>
              <td>{medico.consultorio || 'No asignado'}</td>
              <td>{medico.sede || 'No asignada'}</td>
              <td>
                <button className="edit-btn">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionMedicos;