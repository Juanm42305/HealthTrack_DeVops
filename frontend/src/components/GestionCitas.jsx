import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './GestionCitas.css'; 

function GestionCitas() {
  const [medicos, setMedicos] = useState([]);
  // Ahora guardamos un array de IDs
  const [selectedDoctors, setSelectedDoctors] = useState([]); 
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], 
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

  // Manejo de selección individual
  const toggleDoctor = (id) => {
    if (selectedDoctors.includes(id)) {
      setSelectedDoctors(selectedDoctors.filter(docId => docId !== id));
    } else {
      setSelectedDoctors([...selectedDoctors, id]);
    }
  };

  // Manejo de "Seleccionar Todos"
  const toggleSelectAll = () => {
    if (selectedDoctors.length === medicos.length) {
      setSelectedDoctors([]); // Deseleccionar todo
    } else {
      setSelectedDoctors(medicos.map(doc => doc.user_id)); // Seleccionar todo
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enviar formulario MASIVO
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedDoctors.length === 0) {
        Swal.fire('Atención', 'Debes seleccionar al menos un médico.', 'warning');
        return;
    }

    if (new Date(`${formData.date}T${formData.endTime}`) <= new Date(`${formData.date}T${formData.startTime}`)) {
      Swal.fire('Error de Lógica', 'La hora de fin debe ser posterior a la hora de inicio.', 'warning');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      // Usamos la nueva ruta BULK
      const response = await fetch(`${apiUrl}/api/admin/schedule/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, doctor_ids: selectedDoctors }),
      });

      if (response.ok) {
        const result = await response.json();
        await Swal.fire('¡Éxito!', result.message, 'success');
        setSelectedDoctors([]); // Limpiar selección
      } else {
        Swal.fire('Error', 'Error al generar los horarios.', 'error');
      }
    } catch (error) {
      Swal.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
    }
  };

  if (loading) return <div className="loading-container">Cargando médicos...</div>;

  return (
    <div className="gestion-citas-page">
      
      {/* Columna Izquierda: Lista de Médicos */}
      <div className="citas-main-content"> 
        <h1>Programación Masiva de Agenda</h1>
        <p>Selecciona uno o varios médicos para asignarles el mismo horario.</p>
        
        <div className="actions-bar">
            <button className="btn-select-all" onClick={toggleSelectAll}>
                {selectedDoctors.length === medicos.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
            <span>{selectedDoctors.length} médicos seleccionados</span>
        </div>

        <div className="medicos-list-container">
          {medicos.map(medico => (
            <div 
                key={medico.user_id} 
                className={`medico-card-selectable ${selectedDoctors.includes(medico.user_id) ? 'selected' : ''}`}
                onClick={() => toggleDoctor(medico.user_id)}
            >
              <div className="checkbox-indicator">
                  {selectedDoctors.includes(medico.user_id) && "✔"}
              </div>
              <div className="medico-info">
                <h4>{medico.nombres} {medico.primer_apellido}</h4>
                <p>{medico.especialidad || 'General'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Formulario de Configuración */}
      <div className="citas-sidebar-form"> 
        <h3>Configuración de Horario</h3>
        <p>Se aplicará a los {selectedDoctors.length} seleccionados.</p>
        
        <form onSubmit={handleBulkSubmit}>
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
                <label>Inicio</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange} min="06:00" max="22:00" required />
            </div>
            <div className="form-group">
                <label>Fin</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange} min="06:00" max="22:00" required />
            </div>
            </div>
            <div className="form-group">
            <label>Intervalo (minutos)</label>
            <select name="interval" value={formData.interval} onChange={handleFormChange}>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
            </select>
            </div>
            
            <button type="submit" className="btn-save-bulk" disabled={selectedDoctors.length === 0}>
                Generar Agenda ({selectedDoctors.length})
            </button>
        </form>
      </div>
    </div>
  );
}

export default GestionCitas;