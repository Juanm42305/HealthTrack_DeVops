// Contenido completo para frontend/src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Para saber qué usuario está logueado
import './Profile.css'; // Importaremos el CSS que crearemos

function Profile() {
  const { user } = useAuth(); // Obtenemos la info del usuario (id, username, role)
  
  // Estado para guardar los datos del formulario
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    edad: '',
    fecha_nacimiento: '',
    numero_cedula: ''
  });
  const [loading, setLoading] = useState(true);

  // useEffect para cargar los datos del perfil cuando la página se abre
  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
          const response = await fetch(`${apiUrl}/api/profile/patient/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            // Formateamos la fecha para el input type="date"
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

  // Maneja los cambios en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Se ejecuta al enviar el formulario para guardar los cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/profile/patient/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        alert('✅ ¡Perfil actualizado con éxito!');
      } else {
        alert('Error al guardar los cambios.');
      }
    } catch (error) {
      alert('Error de conexión al intentar guardar.');
    }
  };

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="profile-page">
      {/* --- Barra Lateral del Perfil --- */}
      <aside className="profile-sidebar">
        <div className="user-avatar">
          <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
        </div>
        <h3 className="user-name">{profileData.nombres || user?.username}</h3>
        <p className="user-email">{user?.username}</p>
        
        <nav className="profile-nav">
          <a href="#" className="active">Mi Perfil</a>
          <a href="#">Historial Médico</a>
          <a href="#">Resultados de Laboratorio</a>
        </nav>
      </aside>

      {/* --- Contenido Principal del Formulario --- */}
      <main className="profile-content">
        <h1>Información del Paciente</h1>
        <p>Mantén tus datos actualizados para recibir una mejor atención.</p>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombres</label>
              <input type="text" name="nombres" value={profileData.nombres || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Primer Apellido</label>
              <input type="text" name="primer_apellido" value={profileData.primer_apellido || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Segundo Apellido</label>
              <input type="text" name="segundo_apellido" value={profileData.segundo_apellido || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número de Cédula</label>
              <input type="text" name="numero_cedula" value={profileData.numero_cedula || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Edad</label>
              <input type="number" name="edad" value={profileData.edad || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={profileData.fecha_nacimiento || ''} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Correo / Usuario</label>
              <input type="email" name="username" value={profileData.username} readOnly disabled />
            </div>
          </div>
          
          <button type="submit" className="save-button">Guardar Cambios</button>
        </form>
      </main>
    </div>
  );
}

export default Profile;