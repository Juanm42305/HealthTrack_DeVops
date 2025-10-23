// Contenido COMPLETO y CORREGIDO para frontend/src/components/GestionCitas.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './GestionCitas.css'; 

const promoImages = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&w=400',
  'https://images.unsplash.com/photo-1581091224003-05e1c2e40f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&w=400',
  'https://images.unsplash.com/photo-1538108144341-2b1f8c1f3c3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&q=80&w=400'
];

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === promoImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); 

    return () => clearInterval(timer); 
  }, []);

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
      Swal.fire('Error de Lógica', 'La hora de fin debe ser posterior a la hora de inicio.', 'warning');
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
        await Swal.fire('¡Éxito!', `Agenda para Dr. ${selectedMedico.primer_apellido || selectedMedico.username} generada.`, 'success');
        setSelectedMedico(null); 
      } else {
        Swal.fire('Error', 'Error al generar los horarios.', 'error');
      }
    } catch (error) {
      Swal.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando médicos...</div>;
  }

  // --- ¡ESTRUCTURA CORREGIDA! ---
  return (
    <div className="gestion-citas-page">
      
      {/* --- Contenedor Principal (Izquierda) --- */}
      {/* ¡CAMBIO! Se usa <div> en lugar de <main> */}
      <div className="citas-main-content"> 
        <h1>Gestión de Agenda de Citas</h1>
        <p>Selecciona un médico de la lista para configurar su agenda del día.</p>
        
        <div className="medicos-list-container">
          {medicos.map(medico => (
            <div key={medico.user_id} className="medico-card">
              <div className="medico-info">
                <h4>{medico.nombres || 'Dr.'} {medico.primer_apellido || medico.username}</h4>
                <p>{medico.especialidad || 'Sin especialidad asignada'}</p>
              </div>
              <button className="btn-asignar" onClick={() => setSelectedMedico(medico)}>
                Añadir Horario
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- Contenedor Lateral (Derecha) --- */}
      {/* ¡CAMBIO! Se usa <div> en lugar de <aside> */}
      <div className="citas-sidebar-promo"> 
        <h3>Tu Salud, Nuestra Prioridad</h3>
        <p>Equipos de última generación y los mejores especialistas.</p>
        <div className="image-carousel-container">
          {promoImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt="Instalaciones de HealthTrack"
              className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* --- Formulario Modal (no cambia) --- */}
      {selectedMedico && (
        <div className="modal-overlay" onClick={() => setSelectedMedico(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Generar Agenda para Dr. {selectedMedico.primer_apellido || selectedMedico.username}</h2>
            <form onSubmit={handleFormSubmit}>
              {/* (Tu formulario sigue aquí igual que antes) */}
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
                  <label>Hora de Inicio</label>
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