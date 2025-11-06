// Contenido COMPLETO y CORREGIDO para frontend/src/components/GestionMedicos.jsx
// (Con la función 'handleSaveMedico' AÑADIDA)

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaUserEdit, FaArrowLeft, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EditMedicoModal from './EditMedicoModal'; 
import { useMedicos } from '../context/MedicoContext'; 
import './GestionMedicos.css'; 

function GestionMedicos() {
  const navigate = useNavigate();
  const { medicos, fetchMedicos } = useMedicos(); 
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  // Cargamos los médicos usando el context al montar el componente
  useEffect(() => {
    if (fetchMedicos) {
      fetchMedicos().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMedicos]);


  // --- ¡AÑADIDO! ESTA ES LA LÓGICA DE GUARDADO QUE FALTABA ---
  const handleSaveMedico = async (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    // Usamos el 'user_id' del médico para la URL de la API
    try {
      const response = await fetch(`${apiUrl}/api/admin/doctors/${formData.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Enviamos todos los datos del formulario
      });

      if (response.ok) {
        Swal.fire('¡Éxito!', 'Perfil del médico actualizado.', 'success');
        setSelectedMedico(null); // Cierra el modal
        fetchMedicos(); // Refresca la lista de médicos en la tabla
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.error || 'No se pudo actualizar el perfil.', 'error');
      }
    } catch (error) {
      console.error("Error al guardar médico:", error);
      Swal.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
    }
  };
  // --- FIN DE LA LÓGICA AÑADIDA ---


  // --- LÓGICA PARA ELIMINAR MÉDICO ---
  const handleDeleteMedico = async (medicoId, username) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar al médico ${username}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3498db',
      confirmButtonText: 'Sí, ¡Eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            const response = await fetch(`${apiUrl}/api/admin/doctors/${medicoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Swal.fire('¡Eliminado!', `El médico ${username} ha sido eliminado.`, 'success');
                fetchMedicos(); // Refrescar la lista
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'No se pudo eliminar al médico.', 'error');
            }
        } catch (error) {
            console.error("Error al eliminar médico:", error);
            Swal.fire('Error de Red', 'No se pudo conectar con el servidor para eliminar al médico.', 'error');
        }
    }
  };

  // Función para redirigir a la creación de médicos (el widget está en AdminDashboard)
  const handleAddDoctorRedirect = () => {
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
            <th>Nombre Completo</th>
            <th>Usuario</th>
            <th>Especialidad</th>
            <th>Consultorio</th>
            <th>Sede</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{textAlign: 'center'}}>No hay médicos registrados.</td>
            </tr>
          ) : (
            medicos.map((medico) => (
              <tr key={medico.user_id}>
                <td>{medico.nombres || 'Dr.'} {medico.primer_apellido || ''} {medico.segundo_apellido || ''}</td>
                <td>{medico.username}</td>
                <td>{medico.especialidad || 'General'}</td>
                <td>{medico.consultorio || 'N/A'}</td>
                <td>{medico.sede || 'N/A'}</td>
                <td className="action-buttons">
                  <button 
                    className="edit-btn"
                    onClick={() => setSelectedMedico(medico)}
                  >
                    <FaUserEdit /> Editar
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteMedico(medico.user_id, medico.username)}
                  >
                    <FaTrashAlt /> Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de edición */}
      {selectedMedico && (
        <EditMedicoModal
          medico={selectedMedico}
          onClose={() => setSelectedMedico(null)}
          onSave={handleSaveMedico} // <-- ¡AHORA ESTO FUNCIONA!
        />
      )}
    </div>
  );
}
export default GestionMedicos;