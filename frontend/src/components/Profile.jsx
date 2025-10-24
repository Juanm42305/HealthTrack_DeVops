// Contenido COMPLETO y REORGANIZADO para frontend/src/components/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Profile.css'; // Asegúrate de tener los estilos CSS que te di antes

function Profile() {
  const { user } = useAuth(); // No necesitamos logout aquí
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Para el clic en la imagen (si lo tienes)

  const goBack = () => {
    navigate(-1);
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
              // Formatea la fecha para el input tipo date
              data.fecha_nacimiento = new Date(data.fecha_nacimiento).toISOString().split('T')[0];
            }
            setProfileData(data);
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
          Swal.fire('Error', 'No se pudo cargar tu perfil.', 'error'); // Alerta si falla la carga
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, API_URL_PROFILE]); // Dependencias del useEffect

  const handleChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Opcional: Mostrar previsualización
      // const reader = new FileReader();
      // reader.onloadend = () => { setAvatarPreview(reader.result); }
      // reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    let finalProfileData = { ...profileData };
    let updateSuccess = false; // Renombrado para claridad
    let uploadSuccess = true; // Asumimos éxito si no hay archivo

    // 1. Subir Avatar si existe
    if (selectedFile) {
      uploadSuccess = false; // Cambiamos a falso hasta que suba bien
      const imageFormData = new FormData();
      imageFormData.append('avatar', selectedFile);
      try {
        const uploadResponse = await fetch(`${apiUrl}${API_URL_AVATAR}`, {
          method: 'POST',
          body: imageFormData,
          // No necesitas headers 'Content-Type' aquí, FormData lo maneja
        });
        if (!uploadResponse.ok) {
           const errorData = await uploadResponse.json();
           throw new Error(errorData.error || 'Error al subir la imagen.');
        }
        finalProfileData = await uploadResponse.json(); // Actualiza datos con la URL del avatar
        setProfileData(finalProfileData); // Actualiza el estado local
        setSelectedFile(null); // Limpia el archivo seleccionado
        // setAvatarPreview(null); // Limpia previsualización si la usas
        uploadSuccess = true;
      } catch (error) {
        console.error("Error al subir avatar:", error);
        Swal.fire('Error', error.message || 'Error al subir la foto de perfil.', 'error');
        // Decidimos si queremos detener el guardado completo si falla la imagen
        return; // Detiene si falla la subida de imagen
      }
    }

    // 2. Guardar Datos del Perfil (si la subida fue exitosa o no había archivo)
    if (uploadSuccess) {
        try {
            // Asegúrate de enviar solo los campos editables, no 'username' si es readonly
            const { username, ...editableProfileData } = finalProfileData;
            
            const textDataResponse = await fetch(`${apiUrl}${API_URL_PROFILE}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Envía solo los datos editables
                body: JSON.stringify(editableProfileData), 
            });
            if (textDataResponse.ok) {
                updateSuccess = true;
                // Opcional: Refrescar los datos por si el backend devuelve algo nuevo
                // const updatedData = await textDataResponse.json();
                // setProfileData(updatedData);
            } else {
                const errorData = await textDataResponse.json();
                Swal.fire('Error', errorData.error || 'Error al guardar los datos del perfil.', 'error');
                updateSuccess = false;
            }
        } catch (error) {
            console.error("Error al guardar datos:", error);
            Swal.fire('Error', 'Error de conexión al guardar los datos.', 'error');
            updateSuccess = false;
        }
    }

    // 3. Mostrar mensaje final
    if (updateSuccess && uploadSuccess) {
      Swal.fire('¡Éxito!', 'Perfil actualizado exitosamente.', 'success');
    } else if (updateSuccess && !selectedFile) {
      Swal.fire('¡Éxito!', 'Datos del perfil actualizados.', 'success'); // Mensaje si solo se guardó texto
    }
    // Si hubo error, las alertas ya se mostraron dentro de los try/catch
  };


  if (loading) {
    return <div className="loading-container">Cargando perfil...</div>;
  }

  // --- JSX CON SECCIONES APLICADAS ---
  return (
    <div className="profile-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      <main className="profile-content-area">
        <h1>Mi Perfil de {user?.role === 'medico' ? 'Médico' : 'Paciente'}</h1>
        <p>Mantén tus datos actualizados.</p>

        <form className="profile-form" onSubmit={handleSubmit}>

          {/* --- Sección: Información Personal --- */}
          <h3>Información Personal</h3>
          <div className="form-grid">
            <div className="form-group"><label>Nombres</label><input type="text" name="nombres" value={profileData.nombres || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Primer Apellido</label><input type="text" name="primer_apellido" value={profileData.primer_apellido || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Segundo Apellido</label><input type="text" name="segundo_apellido" value={profileData.segundo_apellido || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Número de Cédula</label><input type="text" name="numero_cedula" value={profileData.numero_cedula || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Fecha de Nacimiento</label><input type="date" name="fecha_nacimiento" value={profileData.fecha_nacimiento || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Edad</label><input type="number" name="edad" value={profileData.edad || ''} onChange={handleChange} /></div>
          </div>

          <hr className="form-divider" />

          {/* --- Sección: Datos Médicos --- */}
          <h3>Datos Médicos</h3>
          {/* Si solo hay un campo, podemos usar single-column para que no sea tan ancho */}
          <div className="form-grid single-column">
            <div className="form-group"><label>Tipo de Sangre</label><input type="text" name="tipo_de_sangre" value={profileData.tipo_de_sangre || ''} onChange={handleChange} placeholder="Ej: O+" /></div>
            {/* Si añades más campos médicos (ej. Alergias), quita single-column y usa form-grid normal */}
          </div>

          <hr className="form-divider" />

          {/* --- Sección: Contacto --- */}
          <h3>Información de Contacto</h3>
          <div className="form-grid">
             {/* Usamos full-width para que ocupen toda la fila */}
             <div className="form-group full-width"><label>Dirección de Residencia</label><input type="text" name="direccion_residencia" value={profileData.direccion_residencia || ''} onChange={handleChange} /></div>
             <div className="form-group full-width"><label>Correo / Usuario</label><input type="email" name="username" value={profileData.username || ''} readOnly disabled /></div>
          </div>

          {/* --- Campos Específicos del Médico (si aplica) --- */}
          {user?.role === 'medico' && (
            <>
              <hr className="form-divider" />
              <h3>Información Profesional</h3>
              <div className="form-grid">
                <div className="form-group"><label>Especialidad</label><input type="text" name="especialidad" value={profileData.especialidad || ''} onChange={handleChange} /></div>
                <div className="form-group"><label>Consultorio</label><input type="text" name="consultorio" value={profileData.consultorio || ''} onChange={handleChange} /></div>
                <div className="form-group"><label>Sede</label><input type="text" name="sede" value={profileData.sede || ''} onChange={handleChange} /></div>
              </div>
            </>
          )}

          <button type="submit" className="save-button">Guardar Cambios</button>
        </form>
      </main>
    </div>
  );
}

export default Profile;