// Contenido actualizado para frontend/src/components/AgendarCita.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AgendarCita.css';

function AgendarCita() {
  const [citasDisponibles, setCitasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState(''); // Estado para el motivo de la cita
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCitasDisponibles = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      // ¡CAMBIO CLAVE! Llamamos a la nueva ruta que solo trae citas generales
      const response = await fetch(`${apiUrl}/api/appointments/available/general`);
      if (response.ok) {
        setCitasDisponibles(await response.json());
      }
      setLoading(false);
    };
    fetchCitasDisponibles();
  }, []);

  const handleAgendar = async (citaId) => {
    if (!motivo) {
      alert("Por favor, describe brevemente el motivo de tu cita.");
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/appointments/book/${citaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // ¡CAMBIO CLAVE! Enviamos también la descripción
      body: JSON.stringify({ patient_id: user.id, description: motivo }),
    });

    if (response.ok) {
      alert('¡Cita agendada con éxito!');
      navigate('/dashboard');
    } else {
      alert('Error al agendar la cita.');
    }
  };
  
  return (
    <div className="agendar-container">
      <h1>Agendar Cita General</h1>
      <p>Selecciona un horario y describe el motivo de tu visita.</p>
      
      <div className="motivo-cita">
        <label>Motivo de la Cita:</label>
        <input 
          type="text" 
          value={motivo} 
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ej: Dolor de cabeza, chequeo general..."
        />
      </div>
      
      {loading ? <p>Cargando horarios...</p> : (
        <div className="citas-list">
          {citasDisponibles.length === 0 ? <p>No hay horarios disponibles.</p> : (
            citasDisponibles.map(cita => (
              <div key={cita.id} className="cita-card">
                <div className="cita-info">
                  {/* ... la información de la cita sigue igual ... */}
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