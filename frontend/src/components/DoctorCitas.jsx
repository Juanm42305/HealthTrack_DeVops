// Contenido COMPLETO y CORREGIDO FINAL para frontend/src/components/DoctorCitas.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaFileMedical } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './MisCitas.css';

function DoctorCitas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  const fetchDoctorCitas = useCallback(async () => {
    if (!user?.id || user.role !== 'medico') {
        setLoading(false); 
        return;
    }

    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      } else {
        Swal.fire('Error', 'No se pudieron cargar tus citas asignadas.', 'error');
      }
    } catch (error) {
      console.error('[DoctorCitas] Error al cargar citas - Catch:', error);
      Swal.fire('Error', 'Error de conexión al cargar tus citas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDoctorCitas();
  }, [fetchDoctorCitas]);

  // Función para formatear la hora manualmente (reutilizada)
  const formatUtcTime = (appointment_time) => {
    const date = new Date(appointment_time);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minStr} ${ampm}`;
  };


  if (loading) {
    return (
      <div className="mis-citas-container">
        <h1 className="loading-text">Cargando tus citas...</h1>
      </div>
    );
  }

  return (
    <div className="mis-citas-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      <div className="mis-citas-container">
        <h1>Mis Citas Asignadas</h1>

        {citas.length === 0 ? (
          <p className="no-citas-text">No tienes citas futuras asignadas.</p>
        ) : (
          <div className="citas-list">
            {citas.map(cita => (
              <div key={cita.id} className="cita-card">
                <h3>Paciente: {cita.patient_nombres || ''} {cita.patient_apellido || ''}</h3>
                 <p><strong>Cédula Paciente:</strong> {cita.patient_cedula || 'No disponible'}</p>
                <p><strong>Fecha:</strong> {new Date(cita.appointment_time).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p>
                  <strong>Hora:</strong>
                  {/* USO DE LA FUNCIÓN DE FORMATO UTC MANUAL */}
                  {formatUtcTime(cita.appointment_time)}
                </p>
                <p><strong>Motivo Agendado:</strong> {cita.description}</p>
                <p><strong>Sede:</strong> {cita.sede}</p>
                <p><strong>Estado:</strong> <span className={`cita-status status-${cita.status}`}> {cita.status === 'agendada' ? 'Agendada' : cita.status} </span></p>

                <button 
                  className="btn-atender-cita"
                  onClick={() => navigate(`/doctor/pacientes/${cita.patient_id}/historiales?citaId=${cita.id}`)}
                >
                  <FaFileMedical /> Iniciar Atención
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default DoctorCitas;