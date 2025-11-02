// frontend/src/components/DoctorHistoriales.jsx

import React, { useState, useEffect, useCallback } from 'react';
// Importamos useSearchParams
import { FaArrowLeft, FaDownload, FaCheckCircle, FaPlusCircle, FaHistory } from 'react-icons/fa';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import HistoriaClinicaForm from './HistoriaClinicaForm';
import './DoctorHistoriales.css'; 

function DoctorHistoriales() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Doctor ID
  const { patientId } = useParams(); // ID del paciente de la URL
  
  // --- Capturamos el citaId de la URL ---
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('citaId'); 
  
  const [patientData, setPatientData] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const goBack = () => navigate(-1);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // --- Lógica de Carga de Historiales ---
  const fetchHistoriales = useCallback(async (pId) => {
    if (!pId) return;
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/${pId}/medical-records`);
      if (response.ok) {
        const data = await response.json();
        setHistoriales(data);
        if (data.length === 0) {
            setSelectedRecord(null); 
        } else {
            setSelectedRecord(data[0]);
        }
      } else {
        Swal.fire('Error', 'No se pudieron cargar los historiales.', 'error');
      }
    } catch (error) {
      console.error("Error cargando historiales:", error);
    }
  }, [apiUrl]);

  // --- Lógica de Carga de Perfil ---
  const fetchPatientProfile = useCallback(async (pId) => {
    try {
      const response = await fetch(`${apiUrl}/api/doctor/patients/${pId}/profile`);
      if (response.ok) {
        setPatientData(await response.json());
      } else {
        setPatientData({});
        Swal.fire('Error', 'No se pudo cargar el perfil del paciente.', 'error');
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (patientId) {
      setLoading(true);
      Promise.all([
        fetchPatientProfile(patientId),
        fetchHistoriales(patientId)
      ]).finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [patientId, fetchPatientProfile, fetchHistoriales]);

  
  // --- Lógica de Guardado (POST/PUT) CORREGIDA ---
  const handleSaveRecord = async (recordData) => {
    setIsSaving(true);
    const method = recordData.id ? 'PUT' : 'POST';
    const url = recordData.id 
      ? `${apiUrl}/api/doctor/patients/${patientId}/medical-records/${recordData.id}`
      : `${apiUrl}/api/doctor/patients/${patientId}/medical-records`;

    // 1. VALIDACIÓN DEL FRONTEND para campos NOT NULL
    if (!user.id) {
        setIsSaving(false);
        return Swal.fire('Error', 'Debe iniciar sesión como médico para guardar.', 'error');
    }
    if (!recordData.motivo_consulta || recordData.motivo_consulta.trim() === '') {
        setIsSaving(false);
        return Swal.fire('Error', 'El campo Motivo de Consulta es obligatorio.', 'error');
    }

    try {
        // 2. Construcción de los datos (Asegura que doctorId se envía correctamente)
        const dataToSend = { 
            ...recordData, 
            doctorId: user.id, // ID del doctor (para la corrección temporal de auth)
            ...(appointmentId && { appointment_id: appointmentId }) // Añade citaId solo si existe en la URL
        }; 

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            Swal.fire('¡Éxito!', `Historial ${method === 'POST' ? 'creado' : 'actualizado'} correctamente.`, 'success');
            await fetchHistoriales(patientId); 
        } else {
            const errorData = await response.json();
            Swal.fire('Error', errorData.error || 'Error interno del servidor al crear el historial.', 'error');
        }
    } catch (error) {
        console.error("Error al guardar historial:", error);
        Swal.fire('Error de Red', 'No se pudo conectar con el servidor.', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  // --- Lógica de Finalizar Cita (CORREGIDA) ---
  const handleFinishAppointment = async () => {
    let idToFinish = appointmentId; 

    if (!idToFinish) {
        // Pedimos el ID manualmente solo si no está en la URL
        const { value: manualAppointmentId } = await Swal.fire({
            title: 'Finalizar Cita',
            text: 'No se detectó el ID de la cita. Ingréselo manualmente para cambiar su estado.',
            input: 'text',
            inputLabel: 'ID de la Cita (ej. 33)',
            inputPlaceholder: 'Ingresa el ID de la cita',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value || isNaN(parseInt(value))) return '¡Necesitas ingresar un número de ID de cita válido!';
            }
        });
        
        if (!manualAppointmentId) return;
        idToFinish = manualAppointmentId;
    }

    // Ejecutar la finalización
    if (idToFinish) {
        try {
            const response = await fetch(`${apiUrl}/api/doctor/appointments/${idToFinish}/finish`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: user.id }) 
            });

            if (response.ok) {
                Swal.fire('¡Cita Finalizada!', 'La cita ha sido marcada como finalizada.', 'success');
                navigate('/doctor/citas'); 
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'No se pudo finalizar la cita.', 'error');
            }
        } catch (error) {
            Swal.fire('Error de Red', 'Error al finalizar la cita.', 'error');
        }
    }
  };


  // --- Lógica para Generar PDF (Placeholder) ---
  const handleGeneratePDF = () => {
    Swal.fire({
      title: 'Generación de PDF',
      text: 'La funcionalidad de descarga de la Historia Clínica en PDF está en desarrollo.',
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
  };

  if (loading) {
    return <div className="loading-container">Cargando datos del paciente...</div>;
  }

  // Vista general si se accede directamente desde el menú
  if (!patientId) {
      return (
          <div className="doctor-historiales-page-content">
              <header className="main-header"><button onClick={goBack} className="back-button"><FaArrowLeft /> Volver</button></header>
              <div className="doctor-historiales-container">
                  <h1>Módulo de Historiales Clínicos</h1>
                  <p>Por favor, busca un paciente en la sección de <Link to="/doctor/pacientes">Pacientes</Link> o inicia la atención desde <Link to="/doctor/citas">Mis Citas</Link>.</p>
              </div>
          </div>
      );
  }


  return (
    <div className="doctor-historiales-page-content">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>
      
      <div className="historial-header-info">
        <h1>Historia Clínica del Paciente</h1>
        <h2>{patientData?.nombres} {patientData?.primer_apellido} ({patientData?.username})</h2>
        <p>Cédula: {patientData?.numero_cedula || 'N/A'} | Edad: {patientData?.edad || 'N/A'} | Cita Actual ID: {appointmentId || 'N/A'}</p>
      </div>

      <div className="historial-content-grid">
        
        {/* --- COLUMNA IZQUIERDA: Listado de Historiales --- */}
        <aside className="historial-sidebar">
            <button 
                className={`btn-sidebar btn-new ${selectedRecord === null ? 'active' : ''}`} 
                onClick={() => setSelectedRecord(null)}
            >
                <FaPlusCircle /> Nuevo Historial
            </button>
            <div className="historial-list">
                <h3><FaHistory /> Historiales Anteriores</h3>
                {historiales.length === 0 ? (
                    <p className="no-records">No hay registros previos.</p>
                ) : (
                    historiales.map(record => (
                        <button 
                            key={record.id}
                            className={`btn-sidebar btn-record ${selectedRecord?.id === record.id ? 'active' : ''}`}
                            onClick={() => setSelectedRecord(record)}
                        >
                            <FaHistory /> Creado: {new Date(record.fecha_creacion).toLocaleDateString()}
                        </button>
                    ))
                )}
            </div>
        </aside>

        {/* --- COLUMNA DERECHA: Formulario de Edición/Creación --- */}
        <main className="historial-form-area">
            <div className="record-actions">
                <button onClick={handleGeneratePDF} disabled={!selectedRecord} className="btn-pdf">
                    <FaDownload /> Descargar PDF
                </button>
                <button 
                  onClick={handleFinishAppointment} 
                  disabled={!appointmentId && !selectedRecord} 
                  className="btn-finish"
                >
                    <FaCheckCircle /> Finalizar Cita
                </button>
            </div>

            {selectedRecord === null ? (
                // Formulario para CREAR nuevo historial
                <HistoriaClinicaForm
                    patientId={patientId}
                    initialData={{ patient_id: patientId }}
                    onSave={handleSaveRecord}
                    isNewRecord={true}
                    isSaving={isSaving}
                />
            ) : (
                // Formulario para EDITAR historial existente
                <HistoriaClinicaForm
                    patientId={patientId}
                    initialData={selectedRecord}
                    onSave={handleSaveRecord}
                    isNewRecord={false}
                    isSaving={isSaving}
                />
            )}
            
        </main>
      </div>
    </div>
  );
}
export default DoctorHistoriales;