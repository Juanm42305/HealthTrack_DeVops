// Contenido completo para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import EditMedicoModal from './EditMedicoModal'; // ¡Importamos el nuevo modal!
import './GestionMedicos.css';

function GestionMedicos() {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ¡NUEVO! Estado para saber qué médico estamos editando. Si es null, el modal está cerrado.
  const [editingMedico, setEditingMedico] = useState(null);

  const fetchMedicos = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/doctors`);
      if (response.ok) {
        const data = await response.json();
        setMedicos(data);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicos();
  }, []);

  // ¡NUEVO! Función para abrir el modal con los datos del médico seleccionado
  const handleEditClick = (medico) => {
    setEditingMedico(medico);
  };

  // ¡NUEVO! Función para cerrar el modal
  const handleCloseModal = () => {
    setEditingMedico(null);
  };

  // ¡NUEVO y MUY IMPORTANTE! Función para guardar los cambios en el backend
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
        handleCloseModal(); // Cierra el modal
        fetchMedicos(); // Vuelve a cargar la lista de médicos para ver los cambios
      } else {
        alert("Error al actualizar el médico.");
      }
    } catch (error) {
      console.error("Error de red al guardar:", error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando médicos...</div>;
  }

  return (
    <div className="gestion-container">
      <h1>Gestión de Médicos</h1>
      <p>Aquí puedes ver y editar la información de los especialistas.</p>

      <table className="medicos-table">
        {/* ... el thead sigue igual ... */}
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
                {/* ¡CAMBIO CLAVE! El botón ahora abre el modal */}
                <button className="edit-btn" onClick={() => handleEditClick(medico)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ¡NUEVO! El modal solo se muestra si hay un médico seleccionado para editar */}
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