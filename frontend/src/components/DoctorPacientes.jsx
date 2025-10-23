import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function DoctorPacientes() {
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
        <h1>Gestión de Pacientes</h1>
        {/* Aquí irá la lógica para buscar y ver pacientes */}
        <p>Próximamente...</p>
      </main>
    </div>
  );
}
export default DoctorPacientes;