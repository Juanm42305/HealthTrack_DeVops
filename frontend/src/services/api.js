// frontend/src/services/api.js

// Función 1: Simula iniciar sesión
export const loginUsuario = async (usuario, password) => {
    if (!usuario || !password) {
        throw new Error("Faltan datos");
    }
    const respuesta = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password })
    });
    if (!respuesta.ok) throw new Error("Error en login");
    return await respuesta.json();
};

// Función 2: Simula pedir lista de pacientes
export const obtenerPacientes = async () => {
    const respuesta = await fetch('/api/doctor/patients');
    if (!respuesta.ok) throw new Error("Error al cargar pacientes");
    return await respuesta.json();
};