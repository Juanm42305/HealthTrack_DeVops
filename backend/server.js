// Contenido completo para backend/server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// --- RUTA DE REGISTRO (AHORA CREA UN PERFIL VACÍO) ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const client = await pool.connect(); // Usamos un cliente para hacer una transacción

  try {
    await client.query('BEGIN'); // Inicia la transacción

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 1. Inserta el nuevo usuario en la tabla 'users'
    const newUserQuery = "INSERT INTO users (username, password, role) VALUES ($1, $2, 'usuario') RETURNING id, username, role";
    const newUserResult = await client.query(newUserQuery, [username, hashedPassword]);
    const newUser = newUserResult.rows[0];

    // 2. Crea un perfil de paciente vacío asociado a este nuevo usuario
    const newProfileQuery = "INSERT INTO patient_profiles (user_id) VALUES ($1)";
    await client.query(newProfileQuery, [newUser.id]);

    await client.query('COMMIT'); // Confirma la transacción
    
    res.status(201).json(newUser);
  } catch (err) {
    await client.query('ROLLBACK'); // Si algo falla, deshace todo
    console.error('Error en el registro:', err.message);
    if (err.code === '23505') {
        return res.status(409).json({ error: "El nombre de usuario ya existe." });
    }
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  } finally {
    client.release(); // Libera el cliente de vuelta al pool
  }
});

// --- RUTA DE LOGIN (AHORA DEVUELVE EL ROL) ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  try {
    // Busca al usuario y su rol
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // ¡ÉXITO! Enviamos el rol del usuario al frontend
    res.json({ 
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        role: user.role // <-- ¡LA PIEZA CLAVE!
      }
    });

  } catch (err) {
    console.error('Error en el login:', err.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
});

// =================================================================
// ============== ¡¡¡NUEVA RUTA AÑADIDA AQUÍ!!! ==============
// =================================================================

// --- RUTA PARA QUE EL ADMIN AÑADA UN MÉDICO ---
// (En un futuro, esta ruta debe estar protegida para que solo la pueda llamar un admin)
app.post('/api/admin/add-doctor', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 1. Inserta el nuevo usuario con rol 'medico'
    const newUserQuery = "INSERT INTO users (username, password, role) VALUES ($1, $2, 'medico') RETURNING id, username, role";
    const newUserResult = await client.query(newUserQuery, [username, hashedPassword]);
    const newDoctor = newUserResult.rows[0];

    // 2. Crea un perfil de médico vacío asociado a este nuevo usuario
    const newProfileQuery = "INSERT INTO doctor_profiles (user_id) VALUES ($1)";
    await client.query(newProfileQuery, [newDoctor.id]);

    await client.query('COMMIT');
    
    res.status(201).json(newDoctor);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al añadir médico:', err.message);
    if (err.code === '23505') {
        return res.status(409).json({ error: "El nombre de usuario ya existe." });
    }
    res.status(500).json({ error: "Error en el servidor al añadir médico" });
  } finally {
    client.release();
  }
});

// --- RUTA PARA OBTENER TODOS LOS MÉDICOS ---
app.get('/api/admin/doctors', async (req, res) => {
  try {
    // Esta consulta une la tabla 'users' con 'doctor_profiles' para obtener toda la info
    const query = `
      SELECT u.id, u.username, dp.* FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.role = 'medico'
    `;
    const doctors = await pool.query(query);
    res.json(doctors.rows);
  } catch (err) {
    console.error('Error al obtener médicos:', err.message);
    res.status(500).json({ error: "Error en el servidor al obtener médicos" });
  }
});

// --- RUTA PARA ACTUALIZAR EL PERFIL DE UN MÉDICO ---
app.put('/api/admin/doctors/:id', async (req, res) => {
  const { id } = req.params; // El ID del usuario/médico a actualizar
  const { 
    nombres, primer_apellido, segundo_apellido, edad, 
    fecha_nacimiento, numero_cedula, especialidad, consultorio, sede 
  } = req.body; // Los nuevos datos que vienen del formulario

  try {
    const query = `
      UPDATE doctor_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, 
          fecha_nacimiento = $5, numero_cedula = $6, especialidad = $7, consultorio = $8, sede = $9
      WHERE user_id = $10
      RETURNING *
    `;
    const values = [
      nombres, primer_apellido, segundo_apellido, edad, 
      fecha_nacimiento, numero_cedula, especialidad, consultorio, sede, id
    ];
    
    const updatedProfile = await pool.query(query, values);

    if (updatedProfile.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró el perfil del médico." });
    }

    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar médico:', err.message);
    res.status(500).json({ error: "Error en el servidor al actualizar médico" });
  }
});

// --- RUTA PARA QUE EL ADMIN CREE HORARIOS DISPONIBLES ---
app.post('/api/admin/schedule', async (req, res) => {
  const { doctor_id, appointment_time, sede } = req.body;

  if (!doctor_id || !appointment_time || !sede) {
    return res.status(400).json({ error: 'Faltan datos para crear el horario.' });
  }

  try {
    const query = "INSERT INTO appointments (doctor_id, appointment_time, sede, status) VALUES ($1, $2, $3, 'disponible') RETURNING *";
    const newSlot = await pool.query(query, [doctor_id, appointment_time, sede]);
    res.status(201).json(newSlot.rows[0]);
  } catch (err) {
    console.error('Error al crear horario:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// --- RUTA PARA QUE EL USUARIO VEA LAS CITAS DISPONIBLES ---
app.get('/api/appointments/available', async (req, res) => {
  try {
    // Consulta que une la cita con el perfil del médico para mostrar su nombre y especialidad
    const query = `
      SELECT a.id, a.appointment_time, a.sede, u.username as doctor_name, dp.nombres as doctor_nombres, dp.primer_apellido as doctor_apellido, dp.especialidad
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE a.status = 'disponible' AND a.appointment_time > NOW()
      ORDER BY a.appointment_time ASC
    `;
    const availableAppointments = await pool.query(query);
    res.json(availableAppointments.rows);
  } catch (err) {
    console.error('Error al obtener citas disponibles:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// --- RUTA PARA QUE UN USUARIO AGENTE UNA CITA ---
app.put('/api/appointments/book/:id', async (req, res) => {
  const { id } = req.params; // El ID de la cita a agendar
  const { patient_id } = req.body; // El ID del paciente que está agendando

  if (!patient_id) {
    return res.status(400).json({ error: 'ID del paciente es requerido.' });
  }

  try {
    // Actualizamos la cita para asignarle el paciente y cambiar su estado
    const query = "UPDATE appointments SET patient_id = $1, status = 'agendada' WHERE id = $2 AND status = 'disponible' RETURNING *";
    const updatedAppointment = await pool.query(query, [patient_id, id]);

    if (updatedAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'La cita no está disponible o no existe.' });
    }

    res.json(updatedAppointment.rows[0]);
  } catch (err) {
    console.error('Error al agendar cita:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});