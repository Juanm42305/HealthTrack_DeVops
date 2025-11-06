// Contenido NUEVO y "SMART" para: frontend/src/components/DoctorResultados.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaFilePdf, FaFileImage, FaDownload, FaArrowLeft, FaFileAlt, FaSearch } from 'react-icons/fa';
import '../components/MisResultados.css'; // Reutilizamos el CSS del paciente
import '../components/GestionLaboratorio.css'; // Reutilizamos el CSS del admin para la búsqueda

function DoctorResultados() {
  // 1. Ver si la URL trae un ID (ej: /pacientes/123/resultados)
  const { patientId } = useParams(); 
  const navigate = useNavigate();

  // 2. Estados
  const [patientIdForResults, setPatientIdForResults] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);

  // 3. Efecto que se activa si la URL trae un patientId
  useEffect(() => {
    if (patientId) {
      setPatientIdForResults(patientId);
    } else {
      setLoading(false); // Si no hay ID, paramos de "cargar" y mostramos la búsqueda
    }
  }, [patientId]);

  // 4. Efecto que busca los resultados CUANDO tenemos un ID de paciente
  useEffect(() => {
    const fetchResultsAndProfile = async () => {
      if (!patientIdForResults) return;

      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        // Buscamos los resultados
        const resultsResponse = await fetch(`${apiUrl}/api/doctor/patients/${patientIdForResults}/lab-results`);
        if (!resultsResponse.ok) throw new Error('Resultados no encontrados');
        setResults(await resultsResponse.json());

        // Buscamos el perfil para mostrar el nombre
        const profileResponse = await fetch(`${apiUrl}/api/doctor/patients/${patientIdForResults}/profile`);
        if (!profileResponse.ok) throw new Error('Perfil no encontrado');
        setPatientProfile(await profileResponse.json());

      } catch (error) {
        Swal.fire('Error', `No se pudieron cargar los datos del paciente: ${error.message}`, 'error');
        setResults([]);
        setPatientProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResultsAndProfile();
  }, [patientIdForResults]);

  // 5. Lógica de Búsqueda (cuando el doctor la usa)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(p => p.numero_cedula && p.numero_cedula.toString() === searchQuery.trim());
        
        if (filteredData.length > 0) {
          // ¡Encontrado! Seteamos el ID del paciente, y el useEffect de arriba hará el resto
          setPatientIdForResults(filteredData[0].user_id);
        } else {
          Swal.fire('No Encontrado', 'No se encontraron pacientes con esa cédula.', 'info');
        }
      } else {
        Swal.fire('Error', 'No se pudo realizar la búsqueda.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión al buscar pacientes.', 'error');
    } finally {
      setLoadingSearch(false);
    }
  };

  const goBack = () => navigate(-1);

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FaFilePdf className="file-icon pdf" />;
    if (['jpg', 'jpeg', 'png'].includes(fileType)) {
      return <FaFileImage className="file-icon image" />;
    }
    return <FaFileAlt className="file-icon" />;
  };

  // --- RENDERIZACIÓN ---

  // Componente para la búsqueda
  const renderSearch = () => (
    <div className="gestion-lab-container">
      <h1>Resultados de Pacientes</h1>
      <p>Busca al paciente por su Cédula para ver sus resultados de laboratorio.</p>
      
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
    </div>
  );

  // Componente para la lista de resultados
  const renderResults = () => (
    <div className="resultados-container">
      <h1>
        Resultados de: {patientProfile?.nombres || ''} {patientProfile?.primer_apellido || ''}
      </h1>
      <p>Cédula: {patientProfile?.numero_cedula}</p>
      {results.length === 0 ? (
        <p className="no-results-text">Este paciente no tiene resultados cargados.</p>
      ) : (
        <div className="results-list">
          {results.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-icon">
                {getFileIcon(result.file_type)}
              </div>
              <div className="result-info">
                <h4>{result.test_name}</h4>
                <p>{result.description || 'Sin descripción.'}</p>
                <span className="result-date">
                  Subido el: {new Date(result.created_at).toLocaleDateString()}
                </span>
              </div>
              <a 
                href={result.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-download"
              >
                <FaDownload /> Ver / Descargar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="resultados-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      {/* Lógica de renderizado principal */}
      {loading ? (
        <div className="resultados-container"><h1>Cargando...</h1></div>
      ) : patientIdForResults ? (
        renderResults() // Muestra resultados si tenemos un ID
      ) : (
        renderSearch() // Muestra la búsqueda si NO tenemos ID
      )}
    </div>
  );
}

export default DoctorResultados;