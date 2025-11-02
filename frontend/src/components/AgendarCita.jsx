// Contenido COMPLETO y CORREGIDO FINAL para frontend/src/components/AgendarCita.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AgendarCita.css';

function AgendarCita() {
  // CORRECCIÓN 1: Inicializar con la fecha de hoy
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
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
          const data = await response.json();
          setAvailableTimes(data);
        } else {
          setAvailableTimes([]);
          Swal.fire('Error', 'No se pudieron cargar los horarios para esta fecha.', 'error');
        }
      } catch (error) {
        console.error("[AgendarCita] Error al cargar horarios:", error);
        Swal.fire('Error', 'Error de conexión al cargar horarios.', 'error');
      } finally {
        setLoadingTimes(false);
      }
    } else {
      setAvailableTimes([]);
    }
  };

  const handleAgendar = async () => {
    if (!selectedSlot || selectedSlot.status !== 'disponible' || !motivo) {
      Swal.fire('Atención', 'Por favor, selecciona un horario disponible y escribe un motivo.', 'warning');
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

  // Se añade useEffect para cargar horarios iniciales al montar
  useEffect(() => {
    // Esto asegura que al cargar la página, se carguen los slots para el día de hoy
    handleDateChange({ target: { value: selectedDate } });
  }, []); 


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
            <input 
              type="date" 
              value={selectedDate} 
              onChange={handleDateChange} 
              min={new Date().toISOString().split('T')[0]} 
            />
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
                  {availableTimes.length > 0 ? availableTimes.map(slot => {
                      return ( 
                        <button
                          key={slot.id}
                          className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''} ${slot.status !== 'disponible' ? 'unavailable' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={slot.status !== 'disponible'}
                        >
                          {/* CORRECCIÓN 2: Mostrar hora como UTC para eliminar el desfase horario (3 AM) */}
                          {new Date(slot.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                          {slot.status !== 'disponible' && <span> (Ocupado)</span>}
                        </button>
                      );
                   }) : <p>No hay horarios programados para este día o ya pasaron.</p>}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="step confirmation">
              <h2>3. Confirma tu cita</h2>
              <div className="confirmation-details">
                <p><strong>Fecha:</strong> {new Date(selectedSlot.appointment_time).toLocaleDateString()}</p>
                {/* Usamos UTC para mostrar la hora de inicio (8:00 AM) */}
                <p><strong>Hora:</strong> {new Date(selectedSlot.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}</p>
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