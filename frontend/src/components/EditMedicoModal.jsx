// Contenido COMPLETO para frontend/src/components/EditMedicoModal.jsx
import React, { useState, useEffect } from 'react';
import './EditMedicoModal.css'; // Asegúrate de que el archivo CSS también exista

function EditMedicoModal({ medico, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...medico });

  useEffect(() => {
    setFormData({ ...medico });
  }, [medico]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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