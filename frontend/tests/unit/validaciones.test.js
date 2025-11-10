// frontend/tests/unit/validaciones.test.js
import {
    calcularTotal,
    crearUsuarioBase,
    obtenerRolesPermitidos,
    esMayorDeEdad,
    esEmailValido,
    obtenerErrorInicial
} from '../../src/utils/validaciones';

describe('Pruebas Unitarias - Validaciones', () => {

    // 1. Matcher: toBe (para valores exactos como números o booleanos)
    test('calcularTotal debe sumar correctamente el precio y el impuesto', () => {
        expect(calcularTotal(100, 20)).toBe(120);
    });

    // 2. Matcher: toEqual (para comparar objetos completos)
    test('crearUsuarioBase debe retornar el objeto de usuario correcto', () => {
        const usuarioEsperado = { nombre: 'Ana', rol: 'usuario', activo: true };
        expect(crearUsuarioBase('Ana')).toEqual(usuarioEsperado);
    });

    // 3. Matcher: toContain (para buscar dentro de listas)
    test('obtenerRolesPermitidos debe incluir "admin" en la lista', () => {
        expect(obtenerRolesPermitidos()).toContain('admin');
    });

    // 4. Matcher: toBeGreaterThanOrEqual (para comparar números)
    // Corregido: ahora comparamos números directos para evitar errores
    test('Una persona de 18 años debe ser mayor de edad', () => {
        const edad = 18;
        expect(edad).toBeGreaterThanOrEqual(18);
        // Y verificamos que nuestra función diga que sí (true)
        expect(esMayorDeEdad(edad)).toBe(true);
    });

    // 5. Matcher: toMatch (para texto o expresiones regulares)
    test('Un email debe contener el símbolo @', () => {
        expect('mi.correo@gmail.com').toMatch(/@/);
        expect(esEmailValido('mi.correo@gmail.com')).toBe(true);
    });

    // 6. Matcher: toBeNull (para verificar valores vacíos)
    test('obtenerErrorInicial debe devolver null al principio', () => {
        expect(obtenerErrorInicial()).toBeNull();
    });

});