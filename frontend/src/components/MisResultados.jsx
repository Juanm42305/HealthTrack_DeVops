// Contenido para: frontend/src/components/MisResultados.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaFilePdf, FaFileImage, FaDownload, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import './MisResultados.css'; // Crearemos este archivo

function MisResultados() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  useEffect(() => {
    if (!user?.id) return;

    const fetchResults = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/patient/${user.id}/my-results`);
        if (response.ok) {
          setResults(await response.json());
        } else {
          Swal.fire('Error', 'No se pudieron cargar tus resultados.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión al cargar resultados.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FaFilePdf className="file-icon pdf" />;
    if (['jpg', 'jpeg', 'png'].includes(fileType)) {
      return <FaFileImage className="file-icon image" />;
    }
    return <FaFileAlt className="file-icon" />; // Icono genérico
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
          <FaArrowLeft /> Volver
        </button>
      </header>

      <div className="resultados-container">
        <h1>Mis Resultados de Laboratorio</h1>
        {results.length === 0 ? (
          <p className="no-results-text">Aún no tienes resultados cargados por un administrador.</p>
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

export default MisResultados;