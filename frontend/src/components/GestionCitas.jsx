// Contenido COMPLETO y REDISEÑADO para frontend/src/components/GestionCitas.jsx
import React, { useState, useEffect } from 'react';
import './GestionCitas.css';

function GestionCitas() {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    startTime: '08:00',
    endTime: '18:00',
    interval: '30',
    sede: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicos = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/admin/doctors`);
        if (response.ok) setMedicos(await response.json());
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
        return alert("La hora de fin debe ser posterior a la hora de inicio.");
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/schedule/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, doctor_id: selectedMedico.user_id }),
      });
      if (response.ok) {
        alert(`Agenda para Dr. ${selectedMedico.primer_apellido || selectedMedico.username} generada.`);
        setSelectedMedico(null);
      } else {
        alert('Error al generar los horarios.');
      }
    } catch (error) {
      alert('Error de red al generar la agenda.');
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
          <div key={medico.user_id} className="medico-card" onClick={() => setSelectedMedico(medico)}>
            <div className="medico-info">
              <h4>{medico.nombres || 'Dr.'} {medico.primer_apellido || medico.username}</h4>
              <p>{medico.especialidad || 'Sin especialidad asignada'}</p>
            </div>
            <button>Añadir Horario</button>
          </div>
        ))}
      </div>
      
      {selectedMedico && (
        <div className="modal-overlay" onClick={() => setSelectedMedico(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Generar Agenda para Dr. {selectedMedico.primer_apellido || selectedMedico.username}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group"><label>Día de Trabajo</label><input type="date" name="date" value={formData.date} min={new Date().toISOString().split('T')[0]} onChange={handleFormChange} required /></div>
              <div className="form-group"><label>Sede</label><input type="text" name="sede" placeholder="Ej: Sede Principal" onChange={handleFormChange} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Hora de Inicio (8 AM - 6 PM)</label><input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} min="08:00" max="18:00" required /></div>
                <div className="form-group"><label>Hora de Fin</label><input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} min="08:00" max="18:00" required /></div>
              </div>
              <div className="form-group"><label>Duración de cada cita (minutos)</label><select name="interval" value={formData.interval} onChange={handleFormChange}><option value="15">15</option><option value="30">30</option><option value="45">45</option><option value="60">60</option></select></div>
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