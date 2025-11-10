// frontend/tests/integration/api.test.js
import { loginUsuario, obtenerPacientes } from '../../src/services/api';

// --- AQUÍ PREPARAMOS EL SIMULACRO (MOCK) ---
// Le decimos a Jest que vigile la función 'fetch'
global.fetch = jest.fn();

beforeEach(() => {
    fetch.mockClear(); // Limpiamos el simulacro antes de cada prueba
});

describe('Pruebas de Integración - API', () => {

    // --- ESCENARIO 1: LOGIN (3 pruebas) ---

    test('1. loginUsuario debe devolver éxito con credenciales correctas', async () => {
        // Simulamos que el backend responde "OK"
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'token-falso-123', usuario: 'Juan' }),
        });

        const respuesta = await loginUsuario('Juan', '1234');
        expect(respuesta).toEqual({ token: 'token-falso-123', usuario: 'Juan' });
        expect(fetch).toHaveBeenCalledTimes(1); // Verificamos que sí se "llamó" al backend
    });

    test('2. loginUsuario debe lanzar error si el backend falla', async () => {
        // Simulamos que el backend dice "Error 401"
        fetch.mockResolvedValueOnce({
            ok: false
        });

        // Esperamos que nuestra función falle
        await expect(loginUsuario('Juan', 'mal-pass')).rejects.toThrow("Error en login");
    });

    test('3. loginUsuario NO debe llamar a fetch si faltan datos', async () => {
        // Intentamos loguearnos sin contraseña
        await expect(loginUsuario('Juan', '')).rejects.toThrow("Faltan datos");
        // Verificamos que NO se molestó al backend
        expect(fetch).not.toHaveBeenCalled();
    });

    // --- ESCENARIO 2: PACIENTES (3 pruebas) ---

    test('4. obtenerPacientes debe devolver una lista cuando todo sale bien', async () => {
        const listaFalsa = [{ id: 1, nombre: 'Paciente Test' }];
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => listaFalsa,
        });

        const resultado = await obtenerPacientes();
        expect(resultado).toEqual(listaFalsa);
        expect(resultado).toHaveLength(1); // Verificamos que hay 1 paciente
    });

    test('5. obtenerPacientes debe manejar una lista vacía', async () => {
         fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [], // Backend responde con lista vacía
        });

        const resultado = await obtenerPacientes();
        expect(resultado).toEqual([]);
        expect(resultado).toHaveLength(0);
    });

    test('6. obtenerPacientes debe lanzar error si el servidor se cae', async () => {
        fetch.mockResolvedValueOnce({
            ok: false, // Simula error 500 del servidor
        });

        await expect(obtenerPacientes()).rejects.toThrow("Error al cargar pacientes");
    });

});