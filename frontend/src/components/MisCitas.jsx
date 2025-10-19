// Contenido para frontend/src/components/MisCitas.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MisCitas.css';

function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMisCitas = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/my-appointments/${user.id}`);
      if(response.ok) setCitas(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user) fetchMisCitas();
  }, [user]);

  const handleCancel = async (citaId) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta cita?")) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/appointments/cancel/${citaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: user.id }),
    });

    if(response.ok) {
      alert("Cita cancelada. El horario ahora está disponible para otros pacientes.");
      fetchMisCitas(); // Refresca la lista
    } else {
      alert("Error al cancelar la cita.");
    }
  };

  return (
    <div className="mis-citas-container">
      <h1>Mis Citas Agendadas</h1>
      {loading ? <p>Cargando...</p> : (
        <div className="citas-list">
          {citas.map(cita => (
            <div key={cita.id} className={`cita-card status-${cita.status}`}>
              <div className="cita-info">
                {/* ... (información de la cita) ... */}
                <p><strong>Fecha:</strong> {new Date(cita.appointment_time).toLocaleDateString()}</p>
                <p><strong>Médico:</strong> {cita.doctor_nombres} {cita.doctor_apellido}</p>
                <p><strong>Motivo:</strong> {cita.description}</p>
                <p><strong>Estado:</strong> <span className="status-badge">{cita.status}</span></p>
              </div>
              {cita.status === 'agendada' && (
                <button onClick={() => handleCancel(cita.id)} className="btn-cancelar">
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