from flask import Flask, render_template, request, redirect, url_for
from database.database import (
    create_tables, get_connection,
    listar_pacientes, listar_doctores,
    agendar_cita, listar_citas, eliminar_cita
)

app = Flask(__name__)

# Crear las tablas al iniciar la app
create_tables()


# ---------- PÁGINA PRINCIPAL ----------
@app.route('/')
def index():
    return render_template('index.html')


# ---------- DOCTORES ----------
@app.route('/doctores', methods=['GET', 'POST'])
def doctores():
    conn = get_connection()
    cursor = conn.cursor()

    especialidades = [
        "Alergología", "Anestesiología", "Cardiología", "Cirugía General", "Cirugía Plástica",
        "Dermatología", "Endocrinología", "Gastroenterología", "Geriatría", "Ginecología",
        "Hematología", "Infectología", "Medicina Interna", "Medicina General", "Nefrología",
        "Neumología", "Neurología", "Nutriología", "Obstetricia", "Oftalmología", "Oncología",
        "Ortopedia", "Otorrinolaringología", "Pediatría", "Psiquiatría", "Radiología",
        "Reumatología", "Traumatología", "Urología", "Medicina del Deporte", "Medicina Familiar",
        "Terapia Física", "Rehabilitación", "Urgencias Médicas"
    ]

    if request.method == 'POST':
        nombre = request.form['nombre']
        especialidad = request.form['especialidad']
        telefono = request.form['telefono']
        correo = request.form['correo']

        # Validar que el teléfono contenga solo números
        if not telefono.isdigit():
            conn.close()
            return "Error: El número de teléfono solo debe contener números.", 400

        cursor.execute("""
            INSERT INTO doctores (nombre, especialidad, telefono, correo)
            VALUES (?, ?, ?, ?)
        """, (nombre, especialidad, telefono, correo))
        conn.commit()

    cursor.execute("SELECT * FROM doctores")
    doctores = cursor.fetchall()
    conn.close()
    return render_template('doctores.html', doctores=doctores, especialidades=especialidades)


# ---------- PACIENTES ----------
@app.route('/pacientes', methods=['GET', 'POST'])
def pacientes():
    conn = get_connection()
    cursor = conn.cursor()

    if request.method == 'POST':
        tipo_identificacion = request.form['tipo_identificacion']
        identificacion = request.form['identificacion']
        nombre = request.form['nombre']
        edad = request.form['edad']
        genero = request.form['genero']
        telefono = request.form['telefono']
        direccion = request.form['direccion']

        # Validación: solo números
        if not identificacion.isdigit() or not telefono.isdigit():
            conn.close()
            return "⚠️ Error: La identificación y el teléfono deben contener solo números.", 400

        cursor.execute("""
            INSERT INTO pacientes (tipo_identificacion, identificacion, nombre, edad, genero, telefono, direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (tipo_identificacion, identificacion, nombre, edad, genero, telefono, direccion))
        conn.commit()

    cursor.execute("SELECT * FROM pacientes")
    pacientes = cursor.fetchall()
    conn.close()
    return render_template('pacientes.html', pacientes=pacientes)

# ---------- CITAS ----------
@app.route('/citas', methods=['GET', 'POST'])
def citas():
    if request.method == 'POST':
        paciente_id = request.form['paciente_id']
        doctor_id = request.form['doctor_id']
        fecha = request.form['fecha']
        hora = request.form['hora']
        motivo = request.form.get('motivo', '')
        agendar_cita(paciente_id, doctor_id, fecha, hora, motivo)
        return redirect(url_for('citas'))

    # Mostrar datos en el formulario
    pacientes = listar_pacientes()
    doctores = listar_doctores()
    citas = listar_citas()
    return render_template('citas.html', citas=citas, pacientes=pacientes, doctores=doctores)


@app.route('/eliminar_cita/<int:id_cita>')
def eliminar_cita_ruta(id_cita):
    eliminar_cita(id_cita)
    return redirect(url_for('citas'))

@app.route('/historial/<int:paciente_id>', methods=['GET', 'POST'])
def historial(paciente_id):
    conn = get_connection()
    cursor = conn.cursor()

    if request.method == 'POST':
        fecha = request.form['fecha']
        diagnostico = request.form['diagnostico']
        tratamiento = request.form['tratamiento']
        tipo_sangre = request.form.get('tipo_sangre', '')
        alergias = request.form.get('alergias', '')
        parientes = request.form.get('parientes', '')
        descripcion = request.form.get('descripcion', '')

        cursor.execute("""
            INSERT INTO historial_clinico
            (paciente_id, fecha, diagnostico, tratamiento, tipo_sangre, alergias, parientes, descripcion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (paciente_id, fecha, diagnostico, tratamiento, tipo_sangre, alergias, parientes, descripcion))
        conn.commit()

    # Cargar datos actualizados
    cursor.execute("SELECT * FROM historial_clinico WHERE paciente_id = ?", (paciente_id,))
    historial = cursor.fetchall()

    # Datos del paciente
    cursor.execute("SELECT * FROM pacientes WHERE id = ?", (paciente_id,))
    paciente = cursor.fetchone()

    conn.close()
    return render_template('ver_historial.html', historial=historial, paciente=paciente)

# ---------- EDITAR HISTORIAL CLÍNICO ----------
@app.route('/editar_historial/<int:id>', methods=['GET', 'POST'])
def editar_historial(id):
    conn = get_connection()
    cursor = conn.cursor()

    # Obtener el registro del historial a editar
    cursor.execute("SELECT * FROM historial_clinico WHERE id = ?", (id,))
    historial = cursor.fetchone()

    if request.method == 'POST':
        fecha = request.form['fecha']
        diagnostico = request.form['diagnostico']
        tratamiento = request.form['tratamiento']
        tipo_sangre = request.form['tipo_sangre']
        alergias = request.form['alergias']
        parientes = request.form['parientes']
        descripcion = request.form['descripcion']

        cursor.execute("""
            UPDATE historial_clinico 
            SET fecha=?, diagnostico=?, tratamiento=?, tipo_sangre=?, alergias=?, parientes=?, descripcion=?
            WHERE id=?
        """, (fecha, diagnostico, tratamiento, tipo_sangre, alergias, parientes, descripcion, id))
        conn.commit()
        conn.close()

        # Redirigir de nuevo al historial del paciente
        return redirect(url_for('historial', paciente_id=historial[1]))

    conn.close()
    return render_template('editar_historial.html', historial=historial)

if __name__ == '__main__':
    app.run(debug=True)
