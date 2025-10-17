// Contenido para frontend/src/components/EditMedicoModal.jsx

import React, { useState, useEffect } from 'react';
import './EditMedicoModal.css';

function EditMedicoModal({ medico, onClose, onSave }) {
  // Un estado local para manejar los datos del formulario
  const [formData, setFormData] = useState({ ...medico });

  // Sincroniza el estado del formulario si el médico a editar cambia
  useEffect(() => {
    setFormData({ ...medico });
  }, [medico]);

  // Maneja los cambios en cualquier input del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Se ejecuta cuando se envía el formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // Llama a la función 'onSave' del componente padre
  };

  return (
    // El fondo oscuro semitransparente
    <div className="modal-overlay" onClick={onClose}>
      {/* El contenedor del formulario (evita que se cierre al hacer clic adentro) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Perfil del Médico</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Nombres</label>
            <input type="text" name="nombres" value={formData.nombres || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Primer Apellido</label>
            <input type="text" name="primer_apellido" value={formData.primer_apellido || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Segundo Apellido</label>
            <input type="text" name="segundo_apellido" value={formData.segundo_apellido || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Especialidad</label>
            <input type="text" name="especialidad" value={formData.especialidad || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Consultorio</label>
            <input type="text" name="consultorio" value={formData.consultorio || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Sede</label>
            <input type="text" name="sede" value={formData.sede || ''} onChange={handleChange} />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMedicoModal;