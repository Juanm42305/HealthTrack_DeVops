// frontend/src/components/DoctorPatients.jsx
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function DoctorPatients() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div className="doctor-patients-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      <div className="doctor-patients-container">
        <h1>Módulo de Pacientes (Próximamente)</h1>
        <p>Aquí se buscarán y gestionarán los pacientes del médico.</p>
      </div>
    </div>
  );
}
export default DoctorPatients;