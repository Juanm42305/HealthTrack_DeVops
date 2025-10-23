import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function DoctorResultados() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div>
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      <main className="profile-content-area">
        <h1>Resultados de Laboratorio</h1>
        {/* Aquí irá la vista de resultados subidos por el admin */}
        <p>Próximamente...</p>
      </main>
    </div>
  );
}
export default DoctorResultados;