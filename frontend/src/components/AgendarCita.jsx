// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/AgendarCita.jsx
// (Con filtro por Especialidad)

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AgendarCita.css';

function AgendarCita() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [motivo, setMotivo] = useState('');
  
  // --- NUEVO ESTADO PARA EL FILTRO ---
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const goBack = () => navigate(-1);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setSelectedSpecialty(''); // Reseteamos el filtro al cambiar de fecha
    
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

  // --- LÓGICA PARA EXTRAER ESPECIALIDADES ÚNICAS ---
  const uniqueSpecialties = useMemo(() => {
    const specialties = availableTimes
      .map(slot => slot.especialidad || 'General') // Si es null, ponemos 'General'
      .filter((value, index, self) => self.indexOf(value) === index); // Eliminar duplicados
    return specialties;
  }, [availableTimes]);

  // --- LÓGICA PARA FILTRAR LOS SLOTS VISIBLES ---
  const filteredSlots = useMemo(() => {
    if (!selectedSpecialty) return availableTimes;
    return availableTimes.filter(slot => (slot.especialidad || 'General') === selectedSpecialty);
  }, [availableTimes, selectedSpecialty]);


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

  useEffect(() => {
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
        <h1>Agendar Cita Médica</h1>
        <p>Filtra por fecha y especialidad para encontrar tu cita ideal.</p>

        <div className="scheduler-steps">
          
          {/* --- PASO 1: FILTROS (FECHA Y ESPECIALIDAD) --- */}
          <div className="step">
            <h2>1. Busca disponibilidad</h2>
            
            <div className="filters-row">
              <div className="filter-group">
                <label>Fecha:</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={handleDateChange} 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>

              {/* Solo mostramos el filtro de especialidad si hay horarios cargados */}
              {availableTimes.length > 0 && (
                <div className="filter-group">
                  <label>Especialidad:</label>
                  <div className="select-wrapper">
                    <select 
                      value={selectedSpecialty} 
                      onChange={(e) => {
                        setSelectedSpecialty(e.target.value);
                        setSelectedSlot(null); // Limpiar selección al cambiar filtro
                      }}
                    >
                      <option value="">Todas las especialidades</option>
                      {uniqueSpecialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <FaFilter className="filter-icon"/>
                  </div>
                </div>
              )}
            </div>
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
              <h2>2. Elige un horario {selectedSpecialty && `(${selectedSpecialty})`}</h2>
              
              {loadingTimes ? <p>Buscando horarios...</p> : (
                <div className="time-slots">
                  {filteredSlots.length > 0 ? filteredSlots.map(slot => {
                      return ( 
                        <button
                          key={slot.id}
                          className={`time-slot ${selectedSlot?.id === slot.id ? 'selected' : ''} ${slot.status !== 'disponible' ? 'unavailable' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={slot.status !== 'disponible'}
                        >
                          <span className="slot-time">
                            {new Date(slot.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                          </span>
                          <span className="slot-doctor">
                            Dr. {slot.doctor_apellido}
                          </span>
                          <span className="slot-spec">
                            {slot.especialidad || 'General'}
                          </span>
                        </button>
                      );
                   }) : (
                     <p className="no-slots-message">
                       {availableTimes.length > 0 
                         ? `No hay citas disponibles para ${selectedSpecialty} en esta fecha.` 
                         : "No hay horarios programados para este día."}
                     </p>
                   )}
                </div>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="step confirmation">
              <h2>3. Confirma tu cita</h2>
              <div className="confirmation-details">
                <p><strong>Fecha:</strong> {new Date(selectedSlot.appointment_time).toLocaleDateString()}</p>
                <p><strong>Hora:</strong> {new Date(selectedSlot.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}</p>
                <p><strong>Médico:</strong> {selectedSlot.doctor_nombres} {selectedSlot.doctor_apellido}</p>
                <p><strong>Especialidad:</strong> {selectedSlot.especialidad || 'Medicina General'}</p>
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