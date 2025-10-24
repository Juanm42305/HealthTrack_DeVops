// Contenido COMPLETO y CORREGIDO para backend/server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2; 

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de Multer
const upload = multer({ dest: 'uploads/' });

// Configuración de la conexión a PostgreSQL
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
  res.json({ message: "¡Backend de HealthTrack funcionando!" });
});


// --- RUTAS DE AUTENTICACIÓN Y USUARIOS ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, 10);
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
    if (err.code === '23505') return res.status(409).json({ error: "El nombre de usuario ya existe." });
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  } finally {
    client.release();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  
  try {
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await pool.query(userQuery, [username]);
    if (userResult.rows.length === 0) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Credenciales inválidas" });

    res.json({ message: "Login exitoso", user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Error en el login:', err.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
});


// --- RUTAS DE PERFIL DE PACIENTE ---
app.get('/api/profile/patient/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT u.username, pp.* FROM users u
      JOIN patient_profiles pp ON u.id = pp.user_id
      WHERE u.id = $1
    `;
    const profile = await pool.query(query, [userId]);
    if (profile.rows.length === 0) return res.status(404).json({ error: "Perfil de paciente no encontrado." });
    res.json(profile.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.put('/api/profile/patient/:userId', async (req, res) => {
  const { userId } = req.params;
  const { nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, tipo_de_sangre, direccion_residencia } = req.body;
  try {
    const query = `
      UPDATE patient_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, fecha_nacimiento = $5, numero_cedula = $6, tipo_de_sangre = $7, direccion_residencia = $8
      WHERE user_id = $9
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, tipo_de_sangre, direccion_residencia, userId];
    const updatedProfile = await pool.query(query, values);
    if (updatedProfile.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado para actualizar." });
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar perfil:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.post('/api/profile/patient/:userId/avatar', upload.single('avatar'), async (req, res) => {
  const { userId } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'healthtrack_avatars',
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });
    const avatarUrl = result.secure_url;
    const query = 'UPDATE patient_profiles SET avatar_url = $1 WHERE user_id = $2 RETURNING *';
    const updatedProfile = await pool.query(query, [avatarUrl, userId]);
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al subir avatar:', err.message);
    res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
  }
});

// --- RUTAS PARA PERFIL DE MÉDICO ---
app.get('/api/profile/doctor/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT u.username, dp.* FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.id = $1
    `;
    const profile = await pool.query(query, [userId]);
    if (profile.rows.length === 0) return res.status(404).json({ error: "Perfil de médico no encontrado." });
    res.json(profile.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil de médico:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.put('/api/profile/doctor/:userId', async (req, res) => {
  const { userId } = req.params;
  const { nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, tipo_de_sangre, direccion_residencia, especialidad, consultorio, sede } = req.body;
  try {
    const query = `
      UPDATE doctor_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, fecha_nacimiento = $5, numero_cedula = $6, 
          tipo_de_sangre = $7, direccion_residencia = $8, especialidad = $9, consultorio = $10, sede = $11
      WHERE user_id = $12
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, tipo_de_sangre, direccion_residencia, especialidad, consultorio, sede, userId];
    const updatedProfile = await pool.query(query, values);
    if (updatedProfile.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado para actualizar." });
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar perfil de médico:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.post('/api/profile/doctor/:userId/avatar', upload.single('avatar'), async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'healthtrack_avatars',
      public_id: `avatar_doc_${userId}`,
      overwrite: true,
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });
    const avatarUrl = result.secure_url;
    const query = 'UPDATE doctor_profiles SET avatar_url = $1 WHERE user_id = $2 RETURNING *';
    const updatedProfile = await pool.query(query, [avatarUrl, userId]);
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al subir avatar de médico:', err.message);
    res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
  }
});


// --- RUTAS DE ADMINISTRADOR ---
app.post('/api/admin/add-doctor', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, 10);
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
    if (err.code === '23505') return res.status(409).json({ error: "El nombre de usuario ya existe." });
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
    if (updatedProfile.rows.length === 0) return res.status(404).json({ error: "No se encontró el perfil del médico." });
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

app.post('/api/admin/schedule/batch', async (req, res) => {
  const { doctor_id, date, startTime, endTime, interval, sede } = req.body;
  if (!doctor_id || !date || !startTime || !endTime || !interval || !sede) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  if (selectedDate < today) {
    return res.status(400).json({ error: 'No se pueden crear horarios en una fecha pasada.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const intervalMinutes = parseInt(interval, 10);
    for (let time = start; time < end; time.setMinutes(time.getMinutes() + intervalMinutes)) {
      const appointment_time = time.toISOString();
      const query = "INSERT INTO appointments (doctor_id, appointment_time, sede, status, appointment_type) VALUES ($1, $2, $3, 'disponible', 'general')";
      await client.query(query, [parseInt(doctor_id, 10), appointment_time, sede]);
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Horarios generados exitosamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear horarios en lote:', err.message);
    res.status(500).json({ error: 'Error en el servidor al generar los horarios.' });
  } finally {
    client.release();
  }
});

app.get('/api/appointments/available-days', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT DATE(appointment_time) as available_date
      FROM appointments
      WHERE status = 'disponible' AND appointment_time > NOW()
      ORDER BY available_date ASC;
    `;
    const result = await pool.query(query);
    const dates = result.rows.map(row => row.available_date.toISOString().split('T')[0]);
    res.json(dates);
  } catch (err) {
    console.error('Error al obtener días disponibles:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/appointments/available-times/:date', async (req, res) => {
  const { date } = req.params;
  try {
    // --- ¡CORRECCIÓN EN EL SELECT! ---
    // Añadimos "a.status" a la lista de columnas seleccionadas.
    const query = `
      SELECT 
        a.id, 
        a.appointment_time, 
        a.sede, 
        a.status, -- <-- ¡ESTABA FALTANDO ESTO!
        u.username as doctor_name, 
        dp.nombres as doctor_nombres, 
        dp.primer_apellido as doctor_apellido, 
        dp.especialidad
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE DATE(a.appointment_time) = $1 
      ORDER BY a.appointment_time ASC;
    `;
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener horarios para la fecha:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// --- ¡ESTE ES EL BLOQUE CORREGIDO! ---
app.put('/api/appointments/book/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id, description } = req.body;
  try {
    const query = "UPDATE appointments SET patient_id = $1, status = 'agendada', description = $2 WHERE id = $3 AND status = 'disponible' RETURNING *";
    const updatedAppointment = await pool.query(query, [patient_id, description, id]);
    if (updatedAppointment.rows.length === 0) return res.status(404).json({ error: 'La cita no está disponible o no existe.' });
    res.json(updatedAppointment.rows[0]);
  } catch (err) { // <--- AÑADÍ LAS LLAVES AQUÍ
    console.error('Error al agendar cita:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  } // <--- Y AQUÍ
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

// --- RUTA "MIS CITAS" (MODIFICADA) ---
app.get('/api/my-appointments/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = `
      SELECT a.id, a.appointment_time, a.sede, a.status, a.description, dp.nombres as doctor_nombres, dp.primer_apellido as doctor_apellido, dp.especialidad
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE a.patient_id = $1 AND a.appointment_time >= NOW()
      ORDER BY a.appointment_time ASC
    `;
    const result = await pool.query(query, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mis citas:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

// --- ¡NUEVA RUTA PARA CITAS DEL MÉDICO! ---
app.get('/api/doctor/my-appointments/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    // Seleccionamos datos de la cita y del paciente asociado
    const query = `
      SELECT 
        a.id, 
        a.appointment_time, 
        a.sede, 
        a.status, 
        a.description, 
        pp.nombres as patient_nombres, 
        pp.primer_apellido as patient_apellido, 
        pp.numero_cedula as patient_cedula 
      FROM appointments a
      JOIN patient_profiles pp ON a.patient_id = pp.user_id 
      WHERE a.doctor_id = $1 
        AND a.status = 'agendada'       -- Solo las agendadas
        AND a.appointment_time >= NOW() -- Solo futuras (igual que paciente)
      ORDER BY a.appointment_time ASC;  -- Las más próximas primero
    `;
    const result = await pool.query(query, [doctorId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener citas del médico:', err.message);
    res.status(500).json({ error: 'Error en el servidor al obtener citas del médico.' });
  }
});

app.put('/api/appointments/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id } = req.body;
  try {
    const query = `
      UPDATE appointments SET status = 'disponible', patient_id = NULL 
      WHERE id = $1 AND patient_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, patient_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No se encontró la cita o no tienes permiso para cancelarla.' });
    res.json({ message: 'Cita cancelada exitosamente.' });
  } catch (err) {
    console.error('Error al cancelar cita:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});