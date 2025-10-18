// Contenido completo y actualizado para backend/server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de la conexión a la base de datos desde las variables de entorno de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// --- RUTA DE PRUEBA ---
app.get('/api', (req, res) => {
  res.json({ message: "¡Hola desde el backend en Render, conectado a la base de datos!" });
});


// --- RUTAS DE AUTENTICACIÓN Y USUARIOS ---

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUserQuery = "INSERT INTO users (username, password, role) VALUES ($1, $2, 'usuario') RETURNING id, username, role";
    const newUserResult = await client.query(newUserQuery, [username, hashedPassword]);
    const newUser = newUserResult.rows[0];

    const newProfileQuery = "INSERT INTO patient_profiles (user_id) VALUES ($1)";
    await client.query(newProfileQuery, [newUser.id]);

    await client.query('COMMIT');
    res.status(201).json(newUser);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en el registro:', err.message);
    if (err.code === '23505') {
        return res.status(409).json({ error: "El nombre de usuario ya existe." });
    }
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  } finally {
    client.release();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  try {
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

    res.json({ 
      message: "Login exitoso",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error en el login:', err.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
});


// --- RUTAS DE ADMINISTRADOR ---

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

    const newUserQuery = "INSERT INTO users (username, password, role) VALUES ($1, $2, 'medico') RETURNING id, username, role";
    const newUserResult = await client.query(newUserQuery, [username, hashedPassword]);
    const newDoctor = newUserResult.rows[0];

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

app.get('/api/admin/doctors', async (req, res) => {
  try {
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

app.put('/api/admin/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const { nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, especialidad, consultorio, sede } = req.body;

  try {
    const query = `
      UPDATE doctor_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, 
          fecha_nacimiento = $5, numero_cedula = $6, especialidad = $7, consultorio = $8, sede = $9
      WHERE user_id = $10
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, especialidad, consultorio, sede, id];
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


// --- RUTAS DE GESTIÓN DE CITAS ---

app.post('/api/admin/schedule', async (req, res) => {
  const { doctor_id, appointment_time, sede } = req.body;
  try {
    const query = "INSERT INTO appointments (doctor_id, appointment_time, sede, status, appointment_type) VALUES ($1, $2, $3, 'disponible', 'general') RETURNING *";
    const newSlot = await pool.query(query, [parseInt(doctor_id, 10), appointment_time, sede]);
    res.status(201).json(newSlot.rows[0]);
  } catch (err) {
    console.error('Error al crear horario:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/appointments/available/general', async (req, res) => {
  try {
    const query = `
      SELECT a.id, a.appointment_time, a.sede, u.username as doctor_name, dp.nombres as doctor_nombres, dp.primer_apellido as doctor_apellido, dp.especialidad
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE a.status = 'disponible' AND a.appointment_type = 'general' AND a.appointment_time > NOW()
      ORDER BY a.appointment_time ASC
    `;
    const availableAppointments = await pool.query(query);
    res.json(availableAppointments.rows);
  } catch (err) {
    console.error('Error al obtener citas generales:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.put('/api/appointments/book/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id, description } = req.body;

  try {
    const query = "UPDATE appointments SET patient_id = $1, status = 'agendada', description = $2 WHERE id = $3 AND status = 'disponible' RETURNING *";
    const updatedAppointment = await pool.query(query, [patient_id, description, id]);

    if (updatedAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'La cita no está disponible o no existe.' });
    }
    res.json(updatedAppointment.rows[0]);
  } catch (err) {
    console.error('Error al agendar cita:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.post('/api/doctor/schedule-procedure', async (req, res) => {
  const { patient_id, doctor_id, appointment_time, sede, description, appointment_type } = req.body;
  try {
    const query = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_time, sede, status, description, appointment_type) 
      VALUES ($1, $2, $3, $4, 'agendada', $5, $6) RETURNING *
    `;
    const newProcedure = await pool.query(query, [patient_id, doctor_id, appointment_time, sede, description, appointment_type]);
    res.status(201).json(newProcedure.rows[0]);
  } catch (err) {
    console.error('Error al agendar procedimiento:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});