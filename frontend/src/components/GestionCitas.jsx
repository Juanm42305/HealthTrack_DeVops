// Contenido COMPLETO y REDISEÑADO para frontend/src/components/GestionCitas.jsx
import React, { useState, useEffect } from 'react';
import './GestionCitas.css'; // Asegúrate de que el CSS exista

function GestionCitas() {
  const [medicos, setMedicos] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '17:00',
    interval: '30',
    sede: ''
  });

  useEffect(() => {
    const fetchMedicos = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/admin/doctors`);
      if (response.ok) setMedicos(await response.json());
    };
    fetchMedicos();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/api/admin/schedule/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, doctor_id: selectedMedico.user_id }),
    });

    if (response.ok) {
      alert(`Horarios para el Dr. ${selectedMedico.primer_apellido} generados exitosamente.`);
      setSelectedMedico(null); // Cierra el formulario
    } else {
      alert('Error al generar los horarios.');
    }
  };

  return (
    <div className="gestion-citas-page">
      <h1>Gestión de Citas</h1>
      <p>Selecciona un médico para añadir su disponibilidad.</p>
      
      <div className="medicos-list-container">
        {medicos.map(medico => (
          <div key={medico.user_id} className="medico-card">
            <h4>{medico.nombres} {medico.primer_apellido}</h4>
            <p>{medico.especialidad}</p>
            <button onClick={() => setSelectedMedico(medico)}>Añadir Horario</button>
          </div>
        ))}
      </div>
      
      {/* --- FORMULARIO MODAL PARA AÑADIR HORARIOS --- */}
      {selectedMedico && (
        <div className="modal-overlay" onClick={() => setSelectedMedico(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Añadir Horarios para Dr. {selectedMedico.primer_apellido}</h2>
            <form onSubmit={handleFormSubmit}>
              {/* ... (aquí van los inputs del formulario) ... */}
              <button type="submit">Generar Horarios</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCitas;