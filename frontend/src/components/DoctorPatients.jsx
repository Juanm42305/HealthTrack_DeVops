// Contenido COMPLETO y con LÓGICA para frontend/src/components/DoctorPatients.jsx

import React, { useState } from 'react';
import { FaArrowLeft, FaSearch, FaUserMd, FaNotesMedical } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom'; // Añadir Link
import { useAuth } from '../context/AuthContext'; // Para obtener ID del doctor si es necesario
import Swal from 'sweetalert2';
import './DoctorPatients.css'; // Crearemos este archivo CSS

function DoctorPatients() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Doctor actual
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null); // Para mostrar perfil en modal
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const goBack = () => navigate(-1);

  // --- Lógica de Búsqueda ---
  const handleSearch = async (e) => {
    e.preventDefault(); // Evita recargar la página si está en un form
    if (!searchQuery.trim()) {
      setSearchResults([]); // Limpia resultados si la búsqueda está vacía
      return;
    }
    setLoadingSearch(true);
    setSelectedPatient(null); // Oculta el modal de perfil si estaba abierto
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        Swal.fire('Error', 'No se pudo realizar la búsqueda.', 'error');
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error buscando pacientes:", error);
      Swal.fire('Error', 'Error de conexión al buscar pacientes.', 'error');
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // --- Lógica para ver perfil ---
  const handleViewProfile = async (patientId) => {
    setLoadingProfile(true);
    setSelectedPatient(null); // Limpia el anterior por si acaso
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      // Usamos la nueva ruta del backend para obtener el perfil COMPLETO
      const response = await fetch(`${apiUrl}/api/doctor/patients/${patientId}/profile`);
      if (response.ok) {
        const profileData = await response.json();
        setSelectedPatient(profileData); // Guarda el perfil completo en el estado
      } else {
        Swal.fire('Error', 'No se pudo cargar el perfil del paciente.', 'error');
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
      Swal.fire('Error', 'Error de conexión al cargar el perfil.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="doctor-patients-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      <div className="doctor-patients-container">
        <h1>Módulo de Pacientes</h1>
        <p>Busca pacientes por nombre, apellido o número de cédula.</p>

        {/* --- Barra de Búsqueda --- */}
        <form onSubmit={handleSearch} className="search-bar-container">
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loadingSearch}>
            {loadingSearch ? 'Buscando...' : <FaSearch />}
          </button>
        </form>

        {/* --- Resultados de Búsqueda --- */}
        {!loadingSearch && searchResults.length > 0 && (
          <div className="search-results-container">
            <h2>Resultados de la Búsqueda</h2>
            <ul className="search-results-list">
              {searchResults.map((patient) => (
                <li key={patient.user_id} className="search-result-item">
                  <div className="patient-info">
                    <span className="patient-name">
                      {patient.nombres || ''} {patient.primer_apellido || ''} {patient.segundo_apellido || ''} ({patient.username})
                    </span>
                    <span className="patient-cedula">
                      Cédula: {patient.numero_cedula || 'N/A'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewProfile(patient.user_id)}
                    className="view-profile-button"
                    disabled={loadingProfile}
                  >
                    Ver Perfil
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!loadingSearch && searchQuery && searchResults.length === 0 && (
           <p className="no-results-text">No se encontraron pacientes que coincidan con "{searchQuery}".</p>
        )}

        {/* --- Modal para Ver Perfil del Paciente --- */}
        {selectedPatient && (
          <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
            <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
              <h2><FaUserMd /> Perfil del Paciente</h2>
              {loadingProfile ? (
                 <p>Cargando perfil...</p>
              ) : (
                <>
                  <div className="patient-profile-details">
                    <p><strong>Nombre Completo:</strong> {selectedPatient.nombres || ''} {selectedPatient.primer_apellido || ''} {selectedPatient.segundo_apellido || ''}</p>
                    <p><strong>Usuario:</strong> {selectedPatient.username}</p>
                    <p><strong>Cédula:</strong> {selectedPatient.numero_cedula || 'No registrado'}</p>
                    <p><strong>Email:</strong> {selectedPatient.email || 'No registrado'}</p>
                    <p><strong>Teléfono:</strong> {selectedPatient.telefono || 'No registrado'}</p>
                    <p><strong>Fecha Nacimiento:</strong> {selectedPatient.fecha_nacimiento ? new Date(selectedPatient.fecha_nacimiento).toLocaleDateString() : 'No registrado'}</p>
                    <p><strong>Edad:</strong> {selectedPatient.edad || 'No registrada'}</p>
                    <p><strong>Tipo de Sangre:</strong> {selectedPatient.tipo_de_sangre || 'No registrado'}</p>
                    <p><strong>Dirección:</strong> {selectedPatient.direccion_residencia || 'No registrada'}</p>
                  </div>
                  <div className="modal-actions profile-actions">
                     {/* Enlace para ir al historial de este paciente */}
                     <Link to={`/doctor/pacientes/${selectedPatient.user_id}/historiales`} className="btn-historial">
                        <FaNotesMedical /> Ver Historial Clínico
                     </Link>
                    <button type="button" className="btn-cancel" onClick={() => setSelectedPatient(null)}>Cerrar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default DoctorPatients;