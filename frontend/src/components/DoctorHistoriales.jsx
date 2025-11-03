// frontend/src/components/DoctorHistoriales.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaDownload, FaCheckCircle, FaPlusCircle, FaHistory } from 'react-icons/fa';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import HistoriaClinicaForm from './HistoriaClinicaForm'; // Asumiendo que HistoriaClinicaForm.jsx existe
import './DoctorHistoriales.css'; 

// --- ¡CORRECCIÓN CRÍTICA DE IMPORTACIÓN DE PDF! ---
import { jsPDF } from "jspdf"; // Importa la clase principal
import autoTable from 'jspdf-autotable'; // Importa el plugin como una función
// --- FIN DE LA CORRECCIÓN ---

function DoctorHistoriales() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const { patientId } = useParams(); 
  
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('citaId'); 
  
  const [patientData, setPatientData] = useState(null);
  const [historiales, setHistoriales] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const goBack = () => navigate(-1);
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // --- Lógica de Carga de Historiales (Actualizada por el backend) ---
  const fetchHistoriales = useCallback(async (pId) => {
    if (!pId) return;
    try {
      // Esta ruta ahora solo trae historiales de citas 'finalizadas' (gracias al backend)
      const response = await fetch(`${apiUrl}/api/doctor/patients/${pId}/medical-records`); 
      if (response.ok) {
        const data = await response.json();
        setHistoriales(data);
        if (data.length === 0) {
            // Si no hay historiales finalizados, mostramos el formulario
            // para la cita actual (si venimos de una).
            if (appointmentId) {
                setSelectedRecord(null); // Nuevo Historial
            } else {
                setSelectedRecord(undefined); // Estado para "seleccione"
            }
        } else {
            setSelectedRecord(data[0]); // Selecciona el más reciente por defecto
        }
      } else {
        Swal.fire('Error', 'No se pudieron cargar los historiales.', 'error');
      }
    } catch (error) {
      console.error("Error cargando historiales:", error);
    }
  }, [apiUrl, appointmentId]); // Depende de appointmentId para saber si debe mostrar "Nuevo"

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
    if (patientId && !isNaN(parseInt(patientId))) { 
      setLoading(true);
      Promise.all([
        fetchPatientProfile(patientId),
        fetchHistoriales(patientId)
      ]).finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [patientId, fetchPatientProfile, fetchHistoriales]);

  
  // --- Lógica de Guardado (POST/PUT) ---
  const handleSaveRecord = async (recordData) => {
    setIsSaving(true);
    const method = recordData.id ? 'PUT' : 'POST';
    const url = recordData.id 
      ? `${apiUrl}/api/doctor/patients/${patientId}/medical-records/${recordData.id}`
      : `${apiUrl}/api/doctor/patients/${patientId}/medical-records`;

    if (!user.id) {
        setIsSaving(false);
        return Swal.fire('Error', 'Debe iniciar sesión como médico para guardar.', 'error');
    }
    if (!recordData.motivo_consulta || recordData.motivo_consulta.trim() === '') {
        setIsSaving(false);
        return Swal.fire('Error', 'El campo Motivo de Consulta es obligatorio.', 'error');
    }

    try {
        const dataToSend = { 
            ...recordData, 
            doctorId: user.id,
            ...(appointmentId && { appointment_id: appointmentId }) 
        }; 

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            const savedRecord = await response.json();
            Swal.fire('¡Éxito!', `Historial ${method === 'POST' ? 'creado' : 'actualizado'} correctamente.`, 'success');
            // NO recargamos la lista (fetchHistoriales) porque la cita aún no está finalizada.
            // Simplemente seleccionamos el historial que acabamos de guardar.
            setSelectedRecord(savedRecord);
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

  // --- Lógica de Finalizar Cita ---
  const handleFinishAppointment = async () => {
    let idToFinish = appointmentId; 

    if (!idToFinish) {
        if(selectedRecord && selectedRecord.appointment_id) {
            idToFinish = selectedRecord.appointment_id;
        } else {
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
    }

    if (idToFinish) {
        try {
            const response = await fetch(`${apiUrl}/api/doctor/appointments/${idToFinish}/finish`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: user.id }) 
            });

            if (response.ok) {
                Swal.fire('¡Cita Finalizada!', 'La cita ha sido marcada como finalizada.', 'success');
                // ¡CAMBIO! Ahora recargamos los historiales DESPUÉS de finalizar
                await fetchHistoriales(patientId);
                // Opcional: Redirigir a la lista de citas
                // navigate('/doctor/citas'); 
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'No se pudo finalizar la cita.', 'error');
            }
        } catch (error) {
            Swal.fire('Error de Red', 'Error al finalizar la cita.', 'error');
        }
    }
  };


  // --- ¡LÓGICA DE GENERACIÓN DE PDF CORREGIDA! ---
  const handleGeneratePDF = () => {
    if (!selectedRecord || !patientData) {
        Swal.fire('Error', 'No hay un historial seleccionado o datos del paciente para generar el PDF.', 'error');
        return;
    }

    const doc = new jsPDF(); // Crea una nueva instancia
    const R = selectedRecord; 
    const P = patientData;  

    // 1. Título y Header
    doc.setFontSize(20);
    doc.text("Historia Clínica - HealthTrack", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 200, 28, { align: 'right' });
    doc.text(`Registro #: ${R.registro || 'N/A'}`, 20, 28);
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30); 

    // 2. Datos del Paciente (Ficha de Identificación)
    doc.setFontSize(14);
    doc.text("Ficha de Identificación del Paciente", 20, 40);
    doc.setFontSize(10);
    // ¡CORRECCIÓN! Usamos autoTable(doc, ...)
    autoTable(doc, { 
        startY: 45,
        theme: 'plain',
        body: [
            ['Paciente:', `${P.nombres || ''} ${P.primer_apellido || ''} ${P.segundo_apellido || ''}`],
            ['Cédula:', P.numero_cedula || 'N/A'],
            ['Edad:', P.edad || 'N/A'],
            ['Sexo:', R.sexo || 'N/A'],
            ['Ocupación:', R.ocupacion || 'N/A'],
        ],
        styles: { fontSize: 10, cellPadding: 1.5 },
    });

    // 3. Detalles de la Consulta
    doc.setFontSize(14);
    // ¡CORRECCIÓN! Usamos doc.lastAutoTable.finalY
    let startY = (doc.lastAutoTable.finalY || 45) + 10;
    doc.text("Detalles de la Consulta", 20, startY);
    doc.setFontSize(10);
    autoTable(doc, {
        startY: startY + 5,
        theme: 'striped',
        head: [['Concepto', 'Descripción']],
        body: [
            ['Fecha de Atención:', new Date(R.fecha_creacion).toLocaleString()],
            ['Motivo de Consulta:', R.motivo_consulta || 'N/A'],
        ],
        styles: { fontSize: 10 },
    });

    // 4. Antecedentes Patológicos
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Antecedentes Personales Patológicos", 20, startY);
    autoTable(doc, {
        startY: startY + 5,
        theme: 'striped',
        head: [['Tipo', 'Detalles']],
        body: [
            ['Cardiovasculares', R.antecedentes_patologicos_cardiovasculares || 'N/A'],
            ['Pulmonares', R.antecedentes_patologicos_pulmonares || 'N/A'],
            ['Digestivos', R.antecedentes_patologicos_digestivos || 'N/A'],
            ['Diabetes', R.antecedentes_patologicos_diabetes || 'N/A'],
            ['Renales', R.antecedentes_patologicos_renales || 'N/A'],
            ['Quirúrgicos', R.antecedentes_patologicos_quirurgicos || 'N/A'],
            ['Alérgicos', R.antecedentes_patologicos_alergicos || 'N/A'],
            ['Transfusiones', R.antecedentes_patologicos_transfusiones || 'N/A'],
            ['Medicamentos', R.antecedentes_patologicos_medicamentos || 'N/A'],
            ['Otros', R.antecedentes_patologicos_especifique || 'N/A'],
        ],
    });

    // 5. Antecedentes No Patológicos
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Antecedentes Personales No Patológicos", 20, startY);
    autoTable(doc, {
        startY: startY + 5,
        theme: 'striped',
        head: [['Tipo', 'Detalles']],
        body: [
            ['Alcohol', R.antecedentes_no_patologicos_alcohol || 'N/A'],
            ['Tabaquismo', R.antecedentes_no_patologicos_tabaquismo || 'N/A'],
            ['Drogas', R.antecedentes_no_patologicos_drogas || 'N/A'],
            ['Inmunizaciones', R.antecedentes_no_patologicos_inmunizaciones || 'N/A'],
            ['Otros', R.antecedentes_no_patologicos_otros || 'N/A'],
        ],
    });

    // 6. Observaciones
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text("Observaciones Generales / Diagnóstico", 20, startY);
    doc.setFontSize(10);
    const observaciones = doc.splitTextToSize(R.observaciones_generales || 'Sin observaciones.', 170);
    doc.text(observaciones, 20, startY + 8);

    // 7. Firma (Placeholder)
    const finalY = startY + 8 + (observaciones.length * 5); 
    doc.line(130, finalY + 20, 190, finalY + 20);
    doc.text(`Firma Dr. ${user.username}`, 130, finalY + 25);

    // 8. Guardar
    doc.save(`Historial_${P.nombres}_${P.numero_cedula}.pdf`);
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
        <h2>
          {patientData?.nombres || patientData?.username} {patientData?.primer_apellido} {patientData?.segundo_apellido} 
          ({patientData?.username})
        </h2>
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
                  // El botón se deshabilita si no hay ID de cita O si no hay historial guardado
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