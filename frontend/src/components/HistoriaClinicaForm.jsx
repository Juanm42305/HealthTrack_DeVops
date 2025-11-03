// frontend/src/components/HistoriaClinicaForm.jsx

import React, { useState, useEffect } from 'react';

// Componente auxiliar para un grupo de campos (para limpieza visual)
const AntecedenteGroup = ({ title, name, formData, handleChange }) => (
  <div className="antecedente-group">
    <span className="antecedente-title">{title}</span>
    <input
      type="text"
      name={name}
      value={formData[name] || ''}
      onChange={handleChange}
      placeholder="Detalles"
      className="antecedente-input"
    />
  </div>
);


function HistoriaClinicaForm({ patientId, initialData, onSave, isNewRecord, isSaving }) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    // Sincroniza los datos iniciales cuando cambian (ej. al abrir otro historial)
    setFormData(initialData || {});
  }, [initialData]);

  // --- LÓGICA CLAVE: GENERACIÓN AUTOMÁTICA DE REGISTRO ---
  useEffect(() => {
    // Generar un número de registro solo si es un nuevo registro y el campo está vacío
    if (isNewRecord && !formData.registro) {
      // Genera un ID basado en el tiempo y un número aleatorio para que sea único
      const timestamp = Date.now().toString().slice(-6); 
      const random = Math.floor(Math.random() * 1000);
      const newRegistro = `HT-${patientId}-${timestamp}-${random}`;
      
      setFormData(prev => ({ ...prev, registro: newRegistro }));
    }
  }, [isNewRecord, formData.registro, patientId]); // Depende de si es nuevo o no

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="historia-clinica-form">
      
      {/* --- FICHA DE IDENTIFICACIÓN --- */}
      <h3>Ficha de Identificación</h3>
      <div className="form-grid-2">
        <div className="form-group">
            <label>Motivo de Consulta (*)</label>
            <input type="text" name="motivo_consulta" value={formData.motivo_consulta || ''} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
            <label>Registro #</label>
            {/* Campo de registro ahora de SOLO LECTURA */}
            <input 
                type="text" 
                name="registro" 
                value={formData.registro || ''} 
                onChange={handleChange} 
                readOnly 
                disabled={!isNewRecord} 
            />
        </div>
        
        <div className="form-group">
            <label>Sexo</label>
            <select name="sexo" value={formData.sexo || ''} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
            </select>
        </div>
        <div className="form-group"><label>Edad</label><input type="number" name="edad" value={formData.edad || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Habitación</label><input type="text" name="habitacion" value={formData.habitacion || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Ocupación</label><input type="text" name="ocupacion" value={formData.ocupacion || ''} onChange={handleChange} /></div>
      </div>
      
      <hr />

      {/* --- ANTECEDENTES PERSONALES PATOLÓGICOS --- */}
      <h3>Antecedentes Personales Patológicos</h3>
      <p className="form-note">Describa detalles clínicos o marque "Negativo".</p>
      <div className="form-grid-2">
        <AntecedenteGroup title="Cardiovasculares" name="antecedentes_patologicos_cardiovasculares" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Pulmonares" name="antecedentes_patologicos_pulmonares" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Digestivos" name="antecedentes_patologicos_digestivos" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Diabetes" name="antecedentes_patologicos_diabetes" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Renales" name="antecedentes_patologicos_renales" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Quirúrgicos" name="antecedentes_patologicos_quirurgicos" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Alérgicos" name="antecedentes_patologicos_alergicos" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Transfusiones" name="antecedentes_patologicos_transfusiones" formData={formData} handleChange={handleChange} />
      </div>
      <div className="form-grid-1">
        <AntecedenteGroup title="Medicamentos (Actuales)" name="antecedentes_patologicos_medicamentos" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Especifique Otros" name="antecedentes_patologicos_especifique" formData={formData} handleChange={handleChange} />
      </div>

      <hr />

      {/* --- ANTECEDENTES PERSONALES NO PATOLÓGICOS --- */}
      <h3>Antecedentes Personales No Patológicos</h3>
      <div className="form-grid-2">
        <AntecedenteGroup title="Alcohol" name="antecedentes_no_patologicos_alcohol" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Tabaquismo" name="antecedentes_no_patologicos_tabaquismo" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Drogas" name="antecedentes_no_patologicos_drogas" formData={formData} handleChange={handleChange} />
        <AntecedenteGroup title="Inmunizaciones" name="antecedentes_no_patologicos_inmunizaciones" formData={formData} handleChange={handleChange} />
      </div>
      <div className="form-grid-1">
        <AntecedenteGroup title="Otros" name="antecedentes_no_patologicos_otros" formData={formData} handleChange={handleChange} />
      </div>

      <hr />

      {/* --- OBSERVACIONES FINALES --- */}
      <h3>Observaciones Generales / Diagnóstico</h3>
      <div className="form-group">
        <textarea 
          name="observaciones_generales"
          value={formData.observaciones_generales || ''}
          onChange={handleChange}
          rows="5"
          placeholder="Escriba aquí las observaciones finales, diagnóstico preliminar y plan de tratamiento."
        ></textarea>
      </div>
      
      {/* --- BOTONES DE ACCIÓN --- */}
      <div className="form-actions">
        <button type="submit" disabled={isSaving} className="btn-save-record">
          {isSaving ? 'Guardando...' : (isNewRecord ? 'Guardar Nuevo Historial' : 'Actualizar Historial')}
        </button>
      </div>
    </form>
  );
}

export default HistoriaClinicaForm;