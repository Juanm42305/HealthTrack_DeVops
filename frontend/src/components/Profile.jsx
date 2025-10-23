// Contenido COMPLETO y LIMPIO para frontend/src/components/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // ¡Importar useNavigate!
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa'; // ¡Importar ícono!
import Swal from 'sweetalert2';
import './Profile.css';

function Profile() {
  const { user, logout } = useAuth(); // 'logout' no se usa aquí, pero lo mantenemos
  const navigate = useNavigate(); // ¡Hook para navegación!
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // --- ¡NUEVA FUNCIÓN PARA VOLVER! ---
  const goBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  const API_URL_PROFILE = user?.role === 'medico' 
    ? `/api/profile/doctor/${user.id}` 
    : `/api/profile/patient/${user.id}`;
    
  const API_URL_AVATAR = user?.role === 'medico'
    ? `/api/profile/doctor/${user.id}/avatar`
    : `/api/profile/patient/${user.id}/avatar`;

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
          const response = await fetch(`${apiUrl}${API_URL_PROFILE}`);
          if (response.ok) {
            let data = await response.json();
            if (data.fecha_nacimiento) {
              data.fecha_nacimiento = new Date(data.fecha_nacimiento).toISOString().split('T')[0];
            }
            setProfileData(data);
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, API_URL_PROFILE]);

  const handleChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    let finalProfileData = { ...profileData };
    let success = false;

    if (selectedFile) {
      const imageFormData = new FormData();
      imageFormData.append('avatar', selectedFile);
      try {
        const uploadResponse = await fetch(`${apiUrl}${API_URL_AVATAR}`, {
          method: 'POST',
          body: imageFormData,
        });
        if (!uploadResponse.ok) throw new Error('Error al subir la imagen.');
        finalProfileData = await uploadResponse.json(); 
        setProfileData(finalProfileData);
        setSelectedFile(null);
        success = true;
      } catch (error) {
        return Swal.fire('Error', 'Error al subir la foto de perfil.', 'error');
      }
    }

    try {
      const textDataResponse = await fetch(`${apiUrl}${API_URL_PROFILE}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProfileData),
      });
      if (textDataResponse.ok) {
        success = true;
      } else {
        Swal.fire('Error', 'Error al guardar los datos del perfil.', 'error');
        success = false;
      }
    } catch (error) {
      Swal.fire('Error', 'Error de conexión al guardar los datos.', 'error');
      success = false;
    }
    
    if (success) {
      Swal.fire('¡Éxito!', 'Perfil actualizado exitosamente.', 'success');
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando perfil...</div>;
  }

  // --- ¡DISEÑO SIMPLIFICADO! ---
  // Se eliminó <aside className="profile-sidebar">
  // Se añadió el <header> con el botón "Volver"
  return (
    <div className="profile-page-content"> {/* Contenedor principal */}
      
      {/* --- ¡BOTÓN DE VOLVER AÑADIDO! --- */}
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      
      {/* Contenido del perfil (el formulario) */}
      <main className="profile-content-area">
        <h1>Mi Perfil de {user?.role === 'medico' ? 'Médico' : 'Paciente'}</h1>
        <p>Mantén tus datos actualizados.</p>
        
        {/* Aquí va el formulario (lo he acortado para el ejemplo) */}
        <form className="profile-form" onSubmit={handleSubmit}>
          {/* ... (Tu <div className="form-grid">...</div> va aquí) ... */}
           <div className="form-grid">
             <div className="form-group"><label>Nombres</label><input type="text" name="nombres" value={profileData.nombres || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Primer Apellido</label><input type="text" name="primer_apellido" value={profileData.primer_apellido || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Segundo Apellido</label><input type="text" name="segundo_apellido" value={profileData.segundo_apellido || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Número de Cédula</label><input type="text" name="numero_cedula" value={profileData.numero_cedula || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Edad</label><input type="number" name="edad" value={profileData.edad || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" name="fecha_nacimiento" value={profileData.fecha_nacimiento || ''} onChange={handleChange} /></div>
             <div className="form-group"><label>Tipo de Sangre</label><input type="text" name="tipo_de_sangre" value={profileData.tipo_de_sangre || ''} onChange={handleChange} placeholder="Ej: O+"/></div>
             <div className="form-group"><label>Dirección de Residencia</label><input type="text" name="direccion_residencia" value={profileData.direccion_residencia || ''} onChange={handleChange} /></div>
             {user?.role === 'medico' && (
               <>
                 <div className="form-group"><label>Especialidad</label><input type="text" name="especialidad" value={profileData.especialidad || ''} onChange={handleChange} /></div>
                 <div className="form-group"><label>Consultorio</label><input type="text" name="consultorio" value={profileData.consultorio || ''} onChange={handleChange} /></div>
                 <div className="form-group"><label>Sede</label><input type="text" name="sede" value={profileData.sede || ''} onChange={handleChange} /></div>
               </>
             )}
             <div className="form-group full-width"><label>Correo / Usuario</label><input type="email" name="username" value={profileData.username || ''} readOnly disabled /></div>
           </div>
          <button type="submit" className="save-button">Guardar Cambios</button>
        </form>
      </main>
    </div>
  );
}

export default Profile;