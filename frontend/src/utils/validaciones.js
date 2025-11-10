// frontend/src/utils/validaciones.js

// 1. Suma simple (para probar toBe)
export const calcularTotal = (precio, impuesto) => {
    return precio + impuesto;
};

// 2. Objeto de usuario (para probar toEqual)
export const crearUsuarioBase = (nombre) => {
    return {
        nombre: nombre,
        rol: 'usuario',
        activo: true
    };
};

// 3. Lista de roles permitidos (para probar toContain)
export const obtenerRolesPermitidos = () => {
    return ['admin', 'medico', 'paciente'];
};

// 4. Validar edad (para probar toBeGreaterThanOrEqual)
export const esMayorDeEdad = (edad) => {
    return edad >= 18;
};

// 5. Validar email (simulado, para probar toMatch con expresiones regulares)
export const esEmailValido = (email) => {
    return /@/.test(email); // Solo verifica que tenga arroba por ahora
};

// 6. Verificar si hay error (para probar toBeNull o toBeDefined)
export const obtenerErrorInicial = () => {
    return null; // Al inicio no hay error
};