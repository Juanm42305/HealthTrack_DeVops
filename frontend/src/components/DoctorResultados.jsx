// Contenido NUEVO para: frontend/src/components/DoctorResultados.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaFilePdf, FaFileImage, FaDownload, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import '../components/MisResultados.css'; // ¡Reutilizamos el CSS del paciente!

function DoctorResultados() {
  const { patientId } = useParams(); // Obtenemos el ID del paciente de la URL
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  useEffect(() => {
    if (!patientId) return;

    const fetchResults = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        // Usamos el endpoint del doctor
        const response = await fetch(`${apiUrl}/api/doctor/patients/${patientId}/lab-results`);
        if (response.ok) {
          setResults(await response.json());
        } else {
          Swal.fire('Error', 'No se pudieron cargar los resultados de este paciente.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión al cargar resultados.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [patientId]);

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FaFilePdf className="file-icon pdf" />;
    if (['jpg', 'jpeg', 'png'].includes(fileType)) {
      return <FaFileImage className="file-icon image" />;
    }
    return <FaFileAlt className="file-icon" />;
  };

  if (loading) {
     return (
        <div className="resultados-page-content">
            <div className="resultados-container">
                <h1>Cargando resultados...</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="resultados-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver (al perfil del paciente)
        </button>
      </header>

      <div className="resultados-container">
        <h1>Resultados del Paciente (ID: {patientId})</h1>
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
                  <h4>{result.test_name}</h4> {/* <-- CAMBIO */}
                  <p>{result.description || 'Sin descripción.'}</p> {/* <-- CAMBIO */}
                  <span className="result-date">
                    Subido el: {new Date(result.created_at).toLocaleDateString()} {/* <-- CAMBIO */}
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
    </div>
  );
}

export default DoctorResultados;