// Contenido para frontend/src/components/AgendarCita.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AgendarCita.css';

function AgendarCita() {
  const [citasDisponibles, setCitasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Necesitamos el ID del paciente que va a agendar
  const navigate = useNavigate();

  const fetchCitasDisponibles = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/appointments/available`);
      if (response.ok) {
        setCitasDisponibles(await response.json());
      }
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitasDisponibles();
  }, []);

  const handleAgendar = async (citaId) => {
    if (!window.confirm("¿Estás seguro de que quieres agendar esta cita?")) {
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/appointments/book/${citaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: user.id }),
      });

      if (response.ok) {
        alert('¡Cita agendada con éxito!');
        navigate('/dashboard'); // O a una página de "mis citas"
      } else {
        const errorData = await response.json();
        alert(`Error al agendar: ${errorData.error}`);
      }
    } catch (error) {
      alert('Error de red al agendar la cita.');
    }
  };

  return (
    <div className="agendar-container">
      <h1>Agendar Nueva Cita</h1>
      <p>Selecciona uno de los horarios disponibles.</p>

      {loading ? (
        <p>Cargando horarios...</p>
      ) : (
        <div className="citas-list">
          {citasDisponibles.length === 0 ? (
            <p>No hay horarios disponibles por el momento. Intenta más tarde.</p>
          ) : (
            citasDisponibles.map(cita => (
              <div key={cita.id} className="cita-card">
                <div className="cita-info">
                  <p><strong>Fecha:</strong> {new Date(cita.appointment_time).toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {new Date(cita.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Médico:</strong> {cita.doctor_nombres} {cita.doctor_apellido}</p>
                  <p><strong>Especialidad:</strong> {cita.especialidad}</p>
                  <p><strong>Sede:</strong> {cita.sede}</p>
                </div>
                <button onClick={() => handleAgendar(cita.id)} className="btn-agendar">
                  Agendar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AgendarCita;