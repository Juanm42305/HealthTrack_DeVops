// Contenido COMPLETO y CORREGIDO para frontend/src/components/GestionMedicos.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaUserEdit, FaArrowLeft, FaPlusCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EditMedicoModal from './EditMedicoModal'; // Importado
import { useMedicos } from '../context/MedicoContext'; // Importado desde context
import './GestionMedicos.css'; 

function GestionMedicos() {
  const navigate = useNavigate();
  const { medicos, fetchMedicos } = useMedicos(); // Usamos el context
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  // Cargamos los médicos al inicio
  useEffect(() => {
    // Si los médicos ya están en el contexto, no necesitamos cargar de nuevo (si ya se hizo en el Dashboard)
    // Pero forzamos la carga por si acaso
    if (fetchMedicos) {
      fetchMedicos().finally(() => setLoading(false));
    }
  }, [fetchMedicos]);


  // Función para manejar el guardado desde el modal
  const handleSaveMedico = async (updatedData) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Solo enviamos los datos relevantes al backend
    const dataToSend = {
      nombres: updatedData.nombres,
      primer_apellido: updatedData.primer_apellido,
      segundo_apellido: updatedData.segundo_apellido,
      especialidad: updatedData.especialidad,
      consultorio: updatedData.consultorio,
      sede: updatedData.sede,
      // Nota: otros campos como edad/cedula/fecha nacimiento se deberían manejar si se necesita editar
    };

    try {
      const response = await fetch(`${apiUrl}/api/admin/doctors/${updatedData.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        Swal.fire('¡Éxito!', 'Perfil de médico actualizado.', 'success');
        setSelectedMedico(null); // Cerrar modal
        fetchMedicos(); // Refrescar la lista de la tabla
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.error || 'Error al actualizar el perfil.', 'error');
      }
    } catch (error) {
      console.error("Error al actualizar médico:", error);
      Swal.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
    }
  };

  // Función para redirigir a la creación de médicos (si es necesario)
  const handleAddDoctorRedirect = () => {
    // Esto te lleva al dashboard principal, donde está el widget para añadir médico
    navigate('/dashboard'); 
  };


  if (loading) {
    return <div className="loading">Cargando lista de médicos...</div>;
  }

  return (
    <div className="gestion-container">
      
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      
      <h1>Gestión de Médicos</h1>
      <p>Lista de especialistas registrados en HealthTrack.</p>

      <button onClick={handleAddDoctorRedirect} className="add-doctor-btn">
        <FaPlusCircle /> Añadir Nuevo Médico (Ir al Dashboard)
      </button>

      <table className="medicos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Especialidad</th>
            <th>Consultorio</th>
            <th>Sede</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos.map((medico) => (
            <tr key={medico.user_id}>
              <td>{medico.nombres || 'N/A'} {medico.primer_apellido || medico.username}</td>
              <td>{medico.username}</td>
              <td>{medico.especialidad || 'General'}</td>
              <td>{medico.consultorio || 'N/A'}</td>
              <td>{medico.sede || 'N/A'}</td>
              <td>
                <button 
                  className="edit-btn"
                  onClick={() => setSelectedMedico(medico)}
                >
                  <FaUserEdit /> Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {selectedMedico && (
        <EditMedicoModal
          medico={selectedMedico}
          onClose={() => setSelectedMedico(null)}
          onSave={handleSaveMedico}
        />
      )}
    </div>
  );
}
export default GestionMedicos;