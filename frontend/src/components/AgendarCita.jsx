// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/AgendarCita.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AgendarCita.css';

function AgendarCita() {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [motivo, setMotivo] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) {
      setLoadingTimes(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/appointments/available-times/${date}`);
        if (response.ok) {
          setAvailableTimes(await response.json());
        } else {
          setAvailableTimes([]);
          Swal.fire('Error', 'No se pudieron cargar los horarios para esta fecha.', 'error');
        }
      } catch (error) {
        console.error("Error al cargar horarios:", error);
        Swal.fire('Error', 'Error de conexión al cargar horarios.', 'error');
      } finally {
        setLoadingTimes(false);
      }
    } else {
      setAvailableTimes([]);
    }
  };

  const handleAgendar = async () => {
    if (!selectedSlot) {
      Swal.fire('Atención', 'Por favor, selecciona un horario disponible.', 'warning');
      return;
    }
    if (selectedSlot.status !== 'disponible') {
        Swal.fire('Atención', 'Este horario ya no está disponible. Por favor, elige otro.', 'warning');
        handleDateChange({ target: { value: selectedDate } }); // Refresca horarios
        return;
    }
    if (!motivo) {
      Swal.fire('Atención', 'Por favor, describe brevemente el motivo de tu cita.', 'warning');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
        const response = await fetch(`${apiUrl}/api/appointments/book/${selectedSlot.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient_id: user.id, description: motivo }),
        });

        if (response.ok) {
            await Swal.fire('¡Éxito!', 'Cita agendada con éxito.', 'success');
            navigate('/user/mis-citas');
        } else {
            const errorData = await response.json();
             if (response.status === 404 || errorData.error?.includes('no está disponible')) {
                 Swal.fire('¡Ups!', 'Alguien más tomó este horario justo ahora. Por favor, selecciona otro.', 'warning');
                 handleDateChange({ target: { value: selectedDate } });
             } else {
                 Swal.fire('Error', errorData.error || 'Error al agendar la cita.', 'error');
             }
        }
    } catch(error) {
        console.error('Error al agendar cita:', error);
        Swal.fire('Error', 'Error de conexión al intentar agendar.', 'error');
    }
  };

  return (
    <div className="agendar-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      <div className="agendar-container">
        <h1>Agendar Cita General</h1>
        <p>Selecciona una fecha para ver los horarios disponibles.</p>

        <div className="scheduler-steps">
          <div className="step">
            <h2>1. Elige una fecha</h2>
            <input type="date" value={selectedDate} onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="motivo-cita">
            <label>Motivo de la Cita:</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Dolor de cabeza, chequeo general..."
            />
          </div>

          {selectedDate && (
            <div className="step">
              <h2>2. Elige un horario</h2>
              {loadingTimes ? <p>Buscando horarios...</p> : (
                <div className="time-slots">
                  {availableTimes.length > 0 ? availableTimes.map(slot => (
                    <button
                      key={slot.id}
                      className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''} ${slot.status !== 'disponible' ? 'unavailable' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={slot.status !== 'disponible'}
                    >
                      {/* --- CAMBIO AQUÍ --- */}
                      {new Date(slot.appointment_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      {slot.status !== 'disponible' && <span> (Ocupado)</span>}
                    </button>
                  )) : <p>No hay horarios programados para este día.</p>}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="step confirmation">
              <h2>3. Confirma tu cita</h2>
              <div className="confirmation-details">
                <p><strong>Fecha:</strong> {new Date(selectedSlot.appointment_time).toLocaleDateString()}</p>
                 {/* --- CAMBIO AQUÍ --- */}
                <p><strong>Hora:</strong> {new Date(selectedSlot.appointment_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                <p><strong>Médico:</strong> {selectedSlot.doctor_nombres} {selectedSlot.doctor_apellido}</p>
                <p><strong>Sede:</strong> {selectedSlot.sede}</p>
                <p><strong>Motivo:</strong> {motivo}</p>
              </div>
              <button onClick={handleAgendar} className="btn-confirmar">Confirmar Cita</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgendarCita;