import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaSearch, FaStethoscope, FaPrescriptionBottleAlt, FaNotesMedical } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './DoctorDiagnosticos.css'; // Crearemos este CSS abajo

function DoctorDiagnosticos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    diagnosis_title: '',
    diagnosis_type: 'Presuntivo',
    description: '',
    prescription: '',
    recommendations: ''
  });

  const goBack = () => navigate(-1);

  // 1. Buscar Paciente (Igual que en DoctorPatients)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    setSelectedPatient(null); // Limpiar selección anterior
    
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Filtro estricto por cédula
        const filteredData = data.filter(p => p.numero_cedula && p.numero_cedula.toString() === searchQuery.trim());
        setSearchResults(filteredData);
        if (filteredData.length === 0) {
            Swal.fire('Sin resultados', 'No se encontró paciente con esa cédula.', 'info');
        }
      }
    } catch (error) {
      Swal.fire('Error', 'Error al buscar paciente.', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  // 2. Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Guardar Diagnóstico
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/diagnoses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patient_id: selectedPatient.user_id,
          doctor_id: user.id
        }),
      });

      if (response.ok) {
        Swal.fire('¡Guardado!', 'Diagnóstico y receta registrados correctamente.', 'success');
        // Resetear formulario
        setFormData({
            diagnosis_title: '',
            diagnosis_type: 'Presuntivo',
            description: '',
            prescription: '',
            recommendations: ''
        });
        setSelectedPatient(null); // Volver a buscar
        setSearchResults([]);
        setSearchQuery('');
      } else {
        Swal.fire('Error', 'No se pudo guardar el diagnóstico.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de red.', 'error');
    }
  };

  return (
    <div className="diagnosticos-page">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      <div className="diagnosticos-container">
        <h1><FaStethoscope /> Registro de Diagnóstico y Tratamiento</h1>
        <p>Busca al paciente para registrar su condición actual y generar su receta.</p>

        {/* --- BARRA DE BÚSQUEDA --- */}
        {!selectedPatient && (
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-bar-container">
                    <input
                    type="text"
                    placeholder="Cédula del Paciente"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.replace(/[^0-9]/g, ''))}
                    className="search-input"
                    />
                    <button type="submit" className="search-button" disabled={loadingSearch}>
                    {loadingSearch ? '...' : <FaSearch />}
                    </button>
                </form>

                <div className="results-list">
                    {searchResults.map(patient => (
                        <div key={patient.user_id} className="patient-result-card">
                            <div className="info">
                                <h3>{patient.nombres} {patient.primer_apellido}</h3>
                                <span>C.C. {patient.numero_cedula}</span>
                            </div>
                            <button className="btn-select" onClick={() => setSelectedPatient(patient)}>
                                Diagnosticar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- FORMULARIO DE DIAGNÓSTICO --- */}
        {selectedPatient && (
            <div className="diagnosis-form-container">
                <div className="patient-header">
                    <h3>Paciente: {selectedPatient.nombres} {selectedPatient.primer_apellido}</h3>
                    <button className="btn-change" onClick={() => setSelectedPatient(null)}>Cambiar</button>
                </div>

                <form onSubmit={handleSubmit} className="diagnosis-form">
                    <div className="form-group">
                        <label>Título del Diagnóstico (*)</label>
                        <input 
                            type="text" 
                            name="diagnosis_title" 
                            value={formData.diagnosis_title} 
                            onChange={handleChange} 
                            placeholder="Ej: Hipertensión Arterial, Gripe Estacional..." 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo de Diagnóstico</label>
                        <select name="diagnosis_type" value={formData.diagnosis_type} onChange={handleChange}>
                            <option value="Presuntivo">Presuntivo (Sospecha)</option>
                            <option value="Definitivo">Definitivo (Confirmado)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Descripción / Observaciones Médicas</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows="3"
                            placeholder="Detalles clínicos del cuadro..."
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label><FaPrescriptionBottleAlt /> Receta Médica / Medicamentos</label>
                            <textarea 
                                name="prescription" 
                                value={formData.prescription} 
                                onChange={handleChange} 
                                rows="5"
                                placeholder="- Acetaminofén 500mg cada 8 horas..."
                                className="prescription-input"
                            ></textarea>
                        </div>
                        <div className="form-group half">
                            <label><FaNotesMedical /> Recomendaciones / Cuidados</label>
                            <textarea 
                                name="recommendations" 
                                value={formData.recommendations} 
                                onChange={handleChange} 
                                rows="5"
                                placeholder="- Reposo absoluto por 2 días..."
                            ></textarea>
                        </div>
                    </div>

                    <button type="submit" className="btn-save-diagnosis">
                        Guardar Diagnóstico y Receta
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
}

export default DoctorDiagnosticos;