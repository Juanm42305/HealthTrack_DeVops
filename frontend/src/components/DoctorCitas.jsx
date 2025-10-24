// Contenido COMPLETO y CON LOGS para frontend/src/components/DoctorCitas.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './MisCitas.css';

function DoctorCitas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  const fetchDoctorCitas = useCallback(async () => {
    // --- ¡LOG AÑADIDO! ---
    console.log('[DoctorCitas] Verificando usuario:', user);

    if (!user?.id || user.role !== 'medico') {
        // --- ¡LOG AÑADIDO! ---
        console.log('[DoctorCitas] Condición de salida temprana cumplida. No se hará fetch.');
        setLoading(false); // Importante quitar el estado de carga
        return;
    }
    // --- FIN LOGS ---

    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      // --- ¡LOG AÑADIDO! ---
      console.log(`[DoctorCitas] Fetching: ${apiUrl}/api/doctor/my-appointments/${user.id}`);

      const response = await fetch(`${apiUrl}/api/doctor/my-appointments/${user.id}`);
      
      // --- ¡LOG AÑADIDO! ---
      console.log('[DoctorCitas] Respuesta API:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        // --- ¡LOG AÑADIDO! ---
        console.log('[DoctorCitas] Citas recibidas:', data);
        setCitas(data);
      } else {
        console.error("[DoctorCitas] Error al cargar citas - Respuesta no OK:", response.status);
        Swal.fire('Error', 'No se pudieron cargar tus citas asignadas.', 'error');
      }
    } catch (error) {
      console.error('[DoctorCitas] Error al cargar citas - Catch:', error);
      Swal.fire('Error', 'Error de conexión al cargar tus citas.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]); // Depende del usuario (doctor)

  useEffect(() => {
    // --- ¡LOG AÑADIDO! ---
    console.log('[DoctorCitas] useEffect ejecutado. Llamando a fetchDoctorCitas...');
    fetchDoctorCitas();
  }, [fetchDoctorCitas]);

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
                  {new Date(cita.appointment_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
                <p><strong>Motivo Consulta:</strong> {cita.description}</p>
                <p><strong>Sede:</strong> {cita.sede}</p>
                <p><strong>Estado:</strong> <span className={`cita-status status-${cita.status}`}> {cita.status === 'agendada' ? 'Agendada' : cita.status} </span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default DoctorCitas;