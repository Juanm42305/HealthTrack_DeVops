import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function DoctorCitas() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <div>
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      <main className="profile-content-area"> {/* Reutilizamos clase para padding */}
        <h1>Mis Citas Asignadas</h1>
        {/* Aquí irá la lógica para mostrar las citas del médico */}
        <p>Próximamente...</p>
      </main>
    </div>
  );
}
export default DoctorCitas;