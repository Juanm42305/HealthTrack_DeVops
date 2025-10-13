import sqlite3
from typing import List

DB_PATH = 'database/healthtrack.db'

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    # Tabla de doctores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            especialidad TEXT NOT NULL,
            telefono TEXT,
            correo TEXT
        )
    ''')

    # Tabla de pacientes
    cursor.execute('''
     CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_identificacion TEXT,
        identificacion TEXT,
        nombre TEXT,
        edad INTEGER,
        genero TEXT,
        telefono TEXT,
        direccion TEXT
    )
    ''')

    # Tabla de historial clínico
    cursor.execute('''
  CREATE TABLE IF NOT EXISTS historial_clinico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        fecha TEXT,
        diagnostico TEXT,
        tratamiento TEXT,
        tipo_sangre TEXT,
        alergias TEXT,
        parientes TEXT,
        descripcion TEXT,
        FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
    )
''')

    # Tabla de citas (esta es la que faltaba)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS citas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            motivo TEXT,
            estado TEXT DEFAULT 'Pendiente',
            FOREIGN KEY(paciente_id) REFERENCES pacientes(id),
            FOREIGN KEY(doctor_id) REFERENCES doctores(id)
        )
    ''')

    conn.commit()
    conn.close()


# ---------- DOCTORES ----------
def agregar_doctor(nombre, especialidad, telefono=None, correo=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO doctores (nombre, especialidad, telefono, correo)
        VALUES (?, ?, ?, ?)
    ''', (nombre, especialidad, telefono, correo))
    conn.commit()
    conn.close()

def listar_doctores():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM doctores ORDER BY nombre')
    rows = cursor.fetchall()
    conn.close()
    return rows

def eliminar_doctor(id_doctor):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM doctores WHERE id = ?', (id_doctor,))
    conn.commit()
    conn.close()


# ---------- PACIENTES ----------
def agregar_paciente(nombre, edad=None, genero=None, telefono=None, direccion=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO pacientes (nombre, edad, genero, telefono, direccion)
        VALUES (?, ?, ?, ?, ?)
    ''', (nombre, edad, genero, telefono, direccion))
    conn.commit()
    conn.close()

def listar_pacientes():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM pacientes ORDER BY nombre')
    rows = cursor.fetchall()
    conn.close()
    return rows

def eliminar_paciente(id_paciente):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM pacientes WHERE id = ?', (id_paciente,))
    conn.commit()
    conn.close()


# ---------- HISTORIAL ----------
def agregar_historial(paciente_id, fecha, diagnostico, tratamiento):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO historial_clinico (paciente_id, fecha, diagnostico, tratamiento)
        VALUES (?, ?, ?, ?)
    ''', (paciente_id, fecha, diagnostico, tratamiento))
    conn.commit()
    conn.close()

def listar_historial_por_paciente(paciente_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM historial_clinico WHERE paciente_id = ? ORDER BY fecha DESC', (paciente_id,))
    rows = cursor.fetchall()
    conn.close()
    return rows


# ---------- CITAS (LO QUE FALTABA) ----------
def agendar_cita(paciente_id, doctor_id, fecha, hora, motivo=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo)
        VALUES (?, ?, ?, ?, ?)
    ''', (paciente_id, doctor_id, fecha, hora, motivo))
    conn.commit()
    conn.close()

def listar_citas():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.id, p.nombre AS paciente, d.nombre AS doctor, c.fecha, c.hora, c.motivo, c.estado
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN doctores d ON c.doctor_id = d.id
        ORDER BY c.fecha DESC, c.hora DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    return rows

def eliminar_cita(id_cita):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM citas WHERE id = ?', (id_cita,))
    conn.commit()
    conn.close()


# Inicialización rápida si ejecutas este archivo directamente
if __name__ == '__main__':
    create_tables()
    print("Tablas (incluyendo 'citas') creadas en", DB_PATH)
