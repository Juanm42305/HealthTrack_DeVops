// Contenido para: frontend/src/components/GestionLaboratorio.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaSearch } from 'react-icons/fa';
import './GestionLaboratorio.css'; // Crearemos este archivo

function GestionLaboratorio() {
  const { user } = useAuth(); // Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  // Estados para el formulario de subida
  const [test_name, setTestName] = useState(''); // <-- CAMBIO: usa test_name
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // (Opcional) Estados para los IDs de tu tabla
  const [doctorId, setDoctorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  // 1. Lógica de Búsqueda (igual a DoctorPatients)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    setSelectedPatient(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(p => p.numero_cedula && p.numero_cedula.toString() === searchQuery.trim());
        setSearchResults(filteredData);
      } else {
        Swal.fire('Error', 'No se pudo realizar la búsqueda.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión al buscar pacientes.', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  // 2. Lógica de Subida de Archivo
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !test_name || !selectedPatient || !user) { // <-- CAMBIO: usa test_name
      Swal.fire('Error', 'Faltan campos (Nombre del examen, archivo o paciente).', 'warning');
      return;
    }
    
    setIsUploading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Usamos FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('test_name', test_name); // <-- CAMBIO: usa test_name
    formData.append('description', description);
    formData.append('patient_id', selectedPatient.user_id);
    formData.append('admin_id', user.id); // El admin que está subiendo
    
    // Añadimos los IDs opcionales si existen
    if (doctorId) formData.append('doctor_id', doctorId);
    if (appointmentId) formData.append('appointment_id', appointmentId);


    try {
      const response = await fetch(`${apiUrl}/api/admin/lab-results`, {
        method: 'POST',
        body: formData,
        // No se pone 'Content-Type', FormData lo maneja
      });

      if (response.ok) {
        await response.json();
        Swal.fire('¡Éxito!', `Resultado "${test_name}" subido para ${selectedPatient.nombres}.`, 'success');
        // Limpiar formulario
        setTestName('');
        setDescription('');
        setDoctorId('');
        setAppointmentId('');
        setFile(null);
        e.target.reset(); // Resetea el input de archivo
      } else {
        const err = await response.json();
        Swal.fire('Error', `Error al subir: ${err.error}`, 'error');
      }
    } catch (error) {
      Swal.fire('Error de Red', 'No se pudo conectar para subir el archivo.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="gestion-lab-container">
      <h1>Módulo de Laboratorio</h1>
      <p>Busca al paciente por su Cédula para asignarle un resultado.</p>

      {/* --- 1. Buscador de Pacientes --- */}
      <form onSubmit={handleSearch} className="search-bar-container">
        <input
          type="text"
          placeholder="Ingresar número de Cédula del paciente"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.replace(/[^0-9]/g, ''))}
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loadingSearch}>
          {loadingSearch ? '...' : <FaSearch />}
        </button>
      </form>

      {/* --- 2. Resultados de Búsqueda --- */}
      {!selectedPatient && searchResults.length > 0 && (
        <div className="search-results-list">
          {searchResults.map((patient) => (
            <div key={patient.user_id} className="search-result-item">
              <span>{patient.nombres} {patient.primer_apellido} ({patient.numero_cedula})</span>
              <button onClick={() => setSelectedPatient(patient)} className="btn-select-patient">
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- 3. Formulario de Subida (si hay paciente) --- */}
      {selectedPatient && (
        <div className="upload-form-container">
          <h3>
            Subiendo resultado para: <strong>{selectedPatient.nombres} {selectedPatient.primer_apellido}</strong>
          </h3>
          <button onClick={() => setSelectedPatient(null)} className="btn-change-patient">
            (Cambiar Paciente)
          </button>

          <form onSubmit={handleUpload} className="lab-upload-form">
            <div className="form-group">
              <label>Nombre del Examen (*)</label>
              <input
                type="text"
                value={test_name} // <-- CAMBIO
                onChange={(e) => setTestName(e.target.value)} // <-- CAMBIO
                placeholder="Ej: Hemograma Completo"
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción (Opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>
            <div className="form-group">
              <label>Archivo (PDF o Imagen) (*)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            
            <hr className="form-divider" />
            <p>Datos Opcionales (para vincular)</p>
            
            <div className="form-row">
                <div className="form-group">
                  <label>ID del Médico (Opcional)</label>
                  <input
                    type="number"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    placeholder="Ej: 2"
                  />
                </div>
                <div className="form-group">
                  <label>ID de la Cita (Opcional)</label>
                  <input
                    type="number"
                    value={appointmentId}
                    onChange={(e) => setAppointmentId(e.target.value)}
                    placeholder="Ej: 45"
                  />
                </div>
            </div>

            <button type="submit" className="btn-save" disabled={isUploading}>
              {isUploading ? 'Subiendo...' : 'Subir y Asignar Resultado'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default GestionLaboratorio;