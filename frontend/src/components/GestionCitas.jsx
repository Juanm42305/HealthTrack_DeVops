// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/GestionCitas.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // <-- ¡IMPORTADO!
import './GestionCitas.css';

function GestionCitas() {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null); 
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], 
    startTime: '08:00',
    endTime: '18:00',
    interval: '30',
    sede: ''
  });
  const [loading, setLoading] = useState(true);

  // Carga la lista de médicos al iniciar el componente
  useEffect(() => {
    const fetchMedicos = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/admin/doctors`);
        if (response.ok) {
          setMedicos(await response.json());
        }
      } catch (error) {
        console.error("Error al cargar médicos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedicos();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (new Date(`${formData.date}T${formData.endTime}`) <= new Date(`${formData.date}T${formData.startTime}`)) {
      // --- ¡CAMBIO! ---
      Swal.fire({
          title: 'Error de Lógica',
          text: 'La hora de fin debe ser posterior a la hora de inicio.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
      });
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/schedule/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, doctor_id: selectedMedico.user_id }),
      });

      if (response.ok) {
        // --- ¡CAMBIO! ---
        // Usamos await para que el modal se cierre DESPUÉS de dar clic en "Aceptar"
        await Swal.fire({
            title: '¡Éxito!',
            text: `Agenda para el Dr. ${selectedMedico.primer_apellido || selectedMedico.username} generada exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
        setSelectedMedico(null); // Cierra el formulario al terminar
      } else {
        // --- ¡CAMBIO! ---
        Swal.fire({
            title: 'Error',
            text: 'Error al generar los horarios. Revise que no existan en la base de datos.',
            icon: 'error',
            confirmButtonText: 'Cerrar'
        });
      }
    } catch (error) {
      // --- ¡CAMBIO! ---
      Swal.fire({
          title: 'Error de Red',
          text: 'No se pudo conectar con el servidor para generar la agenda.',
          icon: 'error',
          confirmButtonText: 'Cerrar'
      });
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando médicos...</div>;
  }

  return (
    <div className="gestion-citas-page">
      <h1>Gestión de Agenda de Citas</h1>
      <p>Selecciona un médico de la lista para configurar su agenda del día.</p>
      
      <div className="medicos-list-container">
        {medicos.map(medico => (
          <div key={medico.user_id} className="medico-card">
            <div className="medico-info">
              <h4>{medico.nombres || 'Dr.'} {medico.primer_apellido || medico.username}</h4>
              <p>{medico.especialidad || 'Sin especialidad asignada'}</p>
            </div>
            <button onClick={() => setSelectedMedico(medico)}>Añadir Horario</button>
          </div>
        ))}
      </div>
      
      {/* --- FORMULARIO MODAL PARA AÑADIR HORARIOS --- */}
      {selectedMedico && (
        <div className="modal-overlay" onClick={() => setSelectedMedico(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Generar Agenda para Dr. {selectedMedico.primer_apellido || selectedMedico.username}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Día de Trabajo</label>
                <input type="date" name="date" value={formData.date} min={new Date().toISOString().split('T')[0]} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Sede</label>
                <input type="text" name="sede" placeholder="Ej: Sede Principal" onChange={handleFormChange} value={formData.sede} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Hora de Inicio (8 AM - 6 PM)</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} min="08:00" max="18:00" required />
                </div>
                <div className="form-group">
                  <label>Hora de Fin</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} min="08:00" max="18:00" required />
                </div>
              </div>
              <div className="form-group">
                <label>Duración de cada cita (minutos)</label>
                <select name="interval" value={formData.interval} onChange={handleFormChange}>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedMedico(null)}>Cancelar</button>
                <button type="submit" className="btn-save">Generar Horarios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCitas;