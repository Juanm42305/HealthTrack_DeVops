import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStethoscope, FaPills, FaNotesMedical } from 'react-icons/fa';
import './MisDiagnosticos.css';

function MisDiagnosticos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => navigate(-1);

  useEffect(() => {
    if (user?.id) {
      const fetchDiagnoses = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
          const res = await fetch(`${apiUrl}/api/patient/${user.id}/my-diagnoses`);
          if (res.ok) setDiagnoses(await res.json());
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchDiagnoses();
    }
  }, [user]);

  if (loading) return <div className="diagnosticos-container">Cargando...</div>;

  return (
    <div className="diagnosticos-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button"><FaArrowLeft /> Volver</button>
      </header>
      <div className="diagnosticos-container">
        <h1>Mis Diagnósticos y Tratamientos</h1>
        {diagnoses.length === 0 ? (
          <p className="no-data">No tienes diagnósticos registrados aún.</p>
        ) : (
          <div className="diagnoses-list">
            {diagnoses.map(diag => (
              <div key={diag.id} className="diagnosis-card">
                <div className="diagnosis-header">
                  <h3>{diag.diagnosis_title}</h3>
                  <span className={`tag ${diag.diagnosis_type === 'Definitivo' ? 'def' : 'pre'}`}>
                    {diag.diagnosis_type}
                  </span>
                </div>
                <p className="doctor-ref">Dr. {diag.doc_nombre} {diag.doc_apellido} ({diag.especialidad})</p>
                <p className="diag-date">{new Date(diag.created_at).toLocaleDateString()}</p>
                
                <div className="diag-body">
                  <div className="section">
                    <h4><FaStethoscope /> Detalles</h4>
                    <p>{diag.description}</p>
                  </div>
                  <div className="section">
                    <h4><FaPills /> Receta / Tratamiento</h4>
                    <p className="prescription-text">{diag.prescription}</p>
                  </div>
                  <div className="section">
                    <h4><FaNotesMedical /> Recomendaciones</h4>
                    <p>{diag.recommendations}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default MisDiagnosticos;