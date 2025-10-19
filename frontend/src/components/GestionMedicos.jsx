// Contenido completo y actualizado para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import { useMedicos } from '../context/MedicoContext';
import EditMedicoModal from './EditMedicoModal';
import './GestionMedicos.css';

function GestionMedicos() {
  const { medicos, fetchMedicos } = useMedicos();
  const [loading, setLoading] = useState(true);
  const [editingMedico, setEditingMedico] = useState(null);

  useEffect(() => {
    // Hemos movido la lógica de fetch al context, pero la llamada inicial se hace aquí.
    // Creamos una función dentro para poder usar async/await.
    const loadMedicos = async () => {
      setLoading(true);
      await fetchMedicos();
      setLoading(false);
    };
    
    loadMedicos();
  }, [fetchMedicos]);

  const handleEditClick = (medico) => {
    setEditingMedico(medico);
  };

  const handleCloseModal = () => {
    setEditingMedico(null);
  };

  const handleSave = async (updatedMedico) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/doctors/${updatedMedico.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMedico),
      });

      if (response.ok) {
        alert("¡Médico actualizado con éxito!");
        handleCloseModal();
        fetchMedicos();
      } else {
        alert("Error al actualizar el médico.");
      }
    } catch (error) {
      console.error("Error de red al guardar:", error);
      alert("Error de conexión al intentar guardar los cambios.");
    }
  };

  // Reemplazamos la lógica de fetchMedicos de antes por esta nueva que usa el context.
  // Y añadimos el console.log para el diagnóstico.
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;

        // --- ¡AQUÍ ESTÁ LA LÍNEA DE DIAGNÓSTICO! ---
        console.log("Intentando conectar a esta URL para obtener médicos:", `${apiUrl}/api/admin/doctors`);
        // -------------------------------------------

        await fetchMedicos();
        setLoading(false);
    };
    loadData();
}, [fetchMedicos]);


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
          {medicos.length > 0 ? (
            medicos.map((medico) => (
              <tr key={medico.user_id}>
                <td>{medico.username}</td>
                <td>{`${medico.nombres || ''} ${medico.primer_apellido || ''}`}</td>
                <td>{medico.especialidad || 'No asignada'}</td>
                <td>{medico.consultorio || 'No asignado'}</td>
                <td>{medico.sede || 'No asignada'}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEditClick(medico)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No hay médicos registrados.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editingMedico && (
        <EditMedicoModal
          medico={editingMedico}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default GestionMedicos;