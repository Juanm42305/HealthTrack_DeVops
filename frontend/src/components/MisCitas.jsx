// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/MisCitas.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './MisCitas.css'; // ¡Importamos los nuevos estilos!

function MisCitas() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Usamos useCallback para que la función no se recree en cada render
  const fetchCitas = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/my-appointments/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      } else {
        Swal.fire('Error', 'No se pudieron cargar tus citas.', 'error');
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      Swal.fire('Error', 'Error de conexión al cargar tus citas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]); // Depende del usuario

  // Cargar las citas cuando el componente se monta
  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const handleCancelarCita = async (citaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Tu cita se cancelará y el horario quedará disponible para alguien más.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar cita',
      cancelButtonText: 'No, conservar'
    });

    if (result.isConfirmed) {
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/appointments/cancel/${citaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: user.id }), // Enviamos el ID para verificar
        });

        if (response.ok) {
          Swal.fire(
            '¡Cancelada!',
            'Tu cita ha sido cancelada exitosamente.',
            'success'
          );
          // Vuelve a cargar las citas para que la cancelada desaparezca
          fetchCitas(); 
        } else {
          const errorData = await response.json();
          Swal.fire('Error', errorData.error || 'No se pudo cancelar la cita.', 'error');
        }
      } catch (error) {
        console.error('Error al cancelar cita:', error);
        Swal.fire('Error', 'Error de conexión al cancelar la cita.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="mis-citas-container">
        <h1 className="loading-text">Cargando tus citas...</h1>
      </div>
    );
  }

  return (
    <div className="mis-citas-container">
      <h1>Mis Citas Agendadas</h1>
      
      {citas.length === 0 ? (
        <p className="no-citas-text">Actualmente no tienes citas futuras agendadas.</p>
      ) : (
        <div className="citas-list">
          {citas.map(cita => (
            <div key={cita.id} className="cita-card"> {/* <-- LA TARJETA INTERACTIVA */}
              <h3>{cita.especialidad || 'Cita General'}</h3>
              <p>
                <strong>Fecha:</strong> 
                {new Date(cita.appointment_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p>
                <strong>Hora:</strong> 
                {new Date(cita.appointment_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <strong>Médico:</strong> 
                {cita.doctor_nombres} {cita.doctor_apellido}
              </p>
              <p>
                <strong>Motivo:</strong> 
                {cita.description}
              </p>
              <p>
                <strong>Sede:</strong> 
                {cita.sede}
              </p>
              <p>
                <strong>Estado:</strong> 
                <span className={`cita-status status-${cita.status}`}>
                  {cita.status === 'agendada' ? 'Agendada' : cita.status}
                </span>
              </p>
              
              {/* Solo mostramos el botón si la cita está 'agendada' */}
              {cita.status === 'agendada' && (
                <button 
                  onClick={() => handleCancelarCita(cita.id)} 
                  className="btn-cancelar"
                >
                  Cancelar Cita
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisCitas;