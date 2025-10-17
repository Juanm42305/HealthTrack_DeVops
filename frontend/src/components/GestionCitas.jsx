// Contenido para frontend/src/components/GestionCitas.jsx

import React, { useState, useEffect } from 'react';
import './GestionCitas.css';

function GestionCitas() {
  const [medicos, setMedicos] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    fecha: '',
    hora: '',
    sede: ''
  });

  // Carga la lista de médicos al iniciar el componente
  useEffect(() => {
    const fetchMedicos = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      // Usamos la ruta que ya teníamos para obtener la lista de médicos
      const response = await fetch(`${apiUrl}/api/admin/doctors`); 
      if (response.ok) {
        setMedicos(await response.json());
      }
    };
    fetchMedicos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { doctor_id, fecha, hora, sede } = formData;
    const appointment_time = `${fecha}T${hora}:00`; // Combinamos fecha y hora

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id, appointment_time, sede }),
      });
      if (response.ok) {
        alert('¡Horario creado exitosamente!');
        // Limpiar formulario
        setFormData({ doctor_id: '', fecha: '', hora: '', sede: '' });
      } else {
        alert('Error al crear el horario.');
      }
    } catch (error) {
      alert('Error de red.');
    }
  };

  return (
    <div className="gestion-citas-container">
      <h1>Programar Agenda de Citas</h1>
      <p>Crea nuevos horarios disponibles para que los pacientes puedan agendar.</p>

      <form className="schedule-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Seleccionar Médico</label>
          <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
            <option value="">-- Elige un médico --</option>
            {medicos.map(medico => (
              <option key={medico.user_id} value={medico.user_id}>
                {`${medico.nombres || ''} ${medico.primer_apellido || ''} (${medico.especialidad || 'General'})`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fecha</label>
          <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Hora</label>
          <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Sede</label>
          <input type="text" name="sede" value={formData.sede} onChange={handleChange} placeholder="Ej: Hospital Central" required />
        </div>

        <button type="submit" className="btn-crear-horario">Crear Horario Disponible</button>
      </form>
    </div>
  );
}

export default GestionCitas;