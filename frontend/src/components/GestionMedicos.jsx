// Contenido completo para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import { useMedicos } from '../context/MedicoContext'; // Usamos el cerebro centralizado de médicos
import EditMedicoModal from './EditMedicoModal';      // Importamos el componente del modal
import './GestionMedicos.css';                         // Importamos los estilos

function GestionMedicos() {
  // Obtenemos la lista de médicos y la función para refrescarla desde el cerebro
  const { medicos, fetchMedicos } = useMedicos();
  const [loading, setLoading] = useState(true);
  
  // Estado para saber qué médico estamos editando. Si es null, el modal está cerrado.
  const [editingMedico, setEditingMedico] = useState(null);

  // useEffect se ejecuta una vez cuando el componente se carga para pedir la lista inicial
  useEffect(() => {
    setLoading(true);
    fetchMedicos().finally(() => setLoading(false));
  }, [fetchMedicos]); // La dependencia asegura que se ejecute si la función cambia

  // Función para abrir el modal con los datos del médico seleccionado
  const handleEditClick = (medico) => {
    setEditingMedico(medico);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setEditingMedico(null);
  };

  // Función que se pasa al modal para guardar los cambios en el backend
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
        fetchMedicos(); // Vuelve a cargar la lista de médicos para ver los cambios al instante
      } else {
        alert("Error al actualizar el médico.");
      }
    } catch (error) {
      console.error("Error de red al guardar:", error);
      alert("Error de conexión al intentar guardar los cambios.");
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

      {/* El modal solo se muestra si hay un médico seleccionado para editar */}
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