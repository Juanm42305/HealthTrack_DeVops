import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function DoctorDiagnosticos() {
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
        <h1>Registrar Diagnóstico</h1>
        {/* Aquí irá el formulario para registrar diagnósticos post-cita */}
        <p>Próximamente...</p>
      </main>
    </div>
  );
}
export default DoctorDiagnosticos;