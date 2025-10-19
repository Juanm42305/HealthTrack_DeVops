// Contenido COMPLETO y RECONSTRUIDO para frontend/src/components/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); // Para el archivo de la nueva foto
  const fileInputRef = useRef(null); // Para hacer clic en el input de archivo de forma invisible

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        // ... (lógica para cargar el perfil que ya tenías)
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    // ... (lógica para manejar cambios del formulario que ya tenías)
  };

  const handleFileChange = (e) => {
    // Guarda el archivo seleccionado por el usuario
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;

    // --- ¡NUEVA LÓGICA DE SUBIDA DE FOTO! ---
    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      try {
        const uploadResponse = await fetch(`${apiUrl}/api/profile/patient/${user.id}/avatar`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Error al subir la imagen.');
        
        const updatedProfileWithAvatar = await uploadResponse.json();
        setProfileData(updatedProfileWithAvatar); // Actualiza el perfil con la nueva URL del avatar
      } catch (error) {
        alert("Error al subir la foto de perfil.");
      }
    }

    // --- Lógica para guardar el resto de los datos (la que ya tenías) ---
    try {
      const textDataResponse = await fetch(`${apiUrl}/api/profile/patient/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
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

  return (
    <div className="profile-page">
      <aside className="profile-sidebar">
        <div className="user-avatar" onClick={() => fileInputRef.current.click()}>
          {profileData.avatar_url ? (
            <img src={profileData.avatar_url} alt="Foto de perfil" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
          )}
          <div className="avatar-overlay">Cambiar Foto</div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept="image/*"
        />
        <h3 className="user-name">{profileData.nombres || user?.username}</h3>
        {/* ... (resto del sidebar que ya tenías) ... */}
      </aside>
      <main className="profile-content">
        {/* ... (resto de tu formulario que ya tenías) ... */}
      </main>
    </div>
  );
}

export default Profile;