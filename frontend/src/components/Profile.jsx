// Contenido COMPLETO y REDISEÑADO para frontend/src/components/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaNotesMedical, FaVials, FaSignOutAlt } from 'react-icons/fa';
import './Profile.css'; // Asegúrate de que el CSS esté vinculado

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
          const response = await fetch(`${apiUrl}/api/profile/patient/${user.id}`);
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
  }, [user]);

  const handleChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    let finalProfileData = { ...profileData };

    if (selectedFile) {
      const imageFormData = new FormData();
      imageFormData.append('avatar', selectedFile);
      try {
        const uploadResponse = await fetch(`${apiUrl}/api/profile/patient/${user.id}/avatar`, {
          method: 'POST',
          body: imageFormData,
        });
        if (!uploadResponse.ok) throw new Error('Error al subir la imagen.');
        const updatedProfileWithAvatar = await uploadResponse.json();
        finalProfileData = { ...finalProfileData, ...updatedProfileWithAvatar };
        setProfileData(finalProfileData);
        setSelectedFile(null);
      } catch (error) {
        return alert("Error al subir la foto de perfil.");
      }
    }

    try {
      const textDataResponse = await fetch(`${apiUrl}/api/profile/patient/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProfileData),
      });
      if (textDataResponse.ok) {
        alert('✅ ¡Perfil actualizado con éxito!');
      } else {
        alert('Error al guardar los datos del perfil.');
      }
    } catch (error) {
      alert('Error de conexión al guardar los datos.');
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando perfil...</div>;
  }

  return (
    <div className="profile-layout">
      {/* --- Barra Lateral del Perfil --- */}
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <h3>💙 HealthTrack</h3>
        </div>
        <div className="user-avatar" onClick={() => fileInputRef.current.click()}>
          {profileData.avatar_url ? (
            <img src={profileData.avatar_url} alt="Foto de perfil" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
          )}
          <div className="avatar-overlay">Cambiar Foto</div>
        </div>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
        <h3 className="user-name">{profileData.nombres || user?.username}</h3>
        <p className="user-email">{user?.username}</p>
        
        <nav className="profile-nav">
          <a href="#" className="nav-link active"><FaUser /> <span>Mi Perfil</span></a>
          <a href="#" className="nav-link"><FaNotesMedical /> <span>Historial Médico</span></a>
          <a href="#" className="nav-link"><FaVials /> <span>Resultados</span></a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button"><FaSignOutAlt /> <span>Cerrar Sesión</span></button>
        </div>
      </aside>

      {/* --- Contenido Principal del Formulario --- */}
      <main className="profile-content">
        <h1>Información del Paciente</h1>
        <p>Mantén tus datos actualizados para recibir una mejor atención.</p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Nombres</label><input type="text" name="nombres" value={profileData.nombres || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Primer Apellido</label><input type="text" name="primer_apellido" value={profileData.primer_apellido || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Segundo Apellido</label><input type="text" name="segundo_apellido" value={profileData.segundo_apellido || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Número de Cédula</label><input type="text" name="numero_cedula" value={profileData.numero_cedula || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Edad</label><input type="number" name="edad" value={profileData.edad || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" name="fecha_nacimiento" value={profileData.fecha_nacimiento || ''} onChange={handleChange} /></div>
            <div className="form-group full-width"><label>Correo / Usuario</label><input type="email" name="username" value={profileData.username || ''} readOnly disabled /></div>
          </div>
          <button type="submit" className="save-button">Guardar Cambios</button>
        </form>
      </main>
    </div>
  );
}

export default Profile;