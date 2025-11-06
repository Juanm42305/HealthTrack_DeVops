// Contenido COMPLETO y DEFINITIVO para backend/server.js
// (CORREGIDO para enviar session.url en lugar de session.id)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2; 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// --- ¡IMPORTANTE! RUTA DE WEBHOOK DE STRIPE ---
app.post('/api/billing/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.client_reference_id;
    const stripePaymentIntentId = session.payment_intent;

    if (invoiceId) {
      try {
        await pool.query(
          "UPDATE invoices SET status = 'paid', stripe_payment_intent_id = $1 WHERE id = $2",
          [stripePaymentIntentId, invoiceId]
        );
        console.log(`✅ Factura ${invoiceId} marcada como pagada.`);
      } catch (err) {
        console.error(`Error al actualizar factura ${invoiceId}:`, err.message);
      }
    }
  }
  res.json({received: true});
});


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

app.get('/api/patient/:patientId/my-results', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = "SELECT * FROM lab_results WHERE patient_id = $1 ORDER BY created_at DESC";
    const results = await pool.query(query, [patientId]);
    res.json(results.rows);
  } catch (err) {
    console.error('Error al obtener mis resultados:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.get('/api/patient/:patientId/my-invoices', async (req, res) => {
    const { patientId } = req.params;
    try {
      const query = "SELECT * FROM invoices WHERE user_id = $1 ORDER BY id DESC";
      const result = await pool.query(query, [patientId]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error al obtener mis facturas:', err.message);
      res.status(500).json({ error: 'Error en el servidor.' });
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
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, 
          fecha_nacimiento = $5, numero_cedula = $6, especialidad = $7, consultorio = $8, sede = $9,
          tipo_de_sangre = $10, direccion_residencia = $11 
      WHERE user_id = $12
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, especialidad, consultorio, sede, tipo_de_sangre, direccion_residencia, userId];
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
    if (updatedProfile.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado para actualizar." });
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar médico:', err.message);
    res.status(500).json({ error: "Error en el servidor al actualizar médico" });
  }
});

app.delete('/api/admin/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'medico']);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontró el médico para eliminar o no tiene el rol correcto." });
    }

    res.json({ message: "Médico y perfil asociado eliminados exitosamente." });
  } catch (err) {
    console.error('Error al eliminar médico:', err.message);
    res.status(500).json({ error: "Error en el servidor al eliminar al médico." });
  } finally {
    client.release();
  }
});

app.post('/api/admin/lab-results', upload.single('file'), async (req, res) => {
  const { 
    patient_id, admin_id, test_name, description, doctor_id, appointment_id
  } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo.' });
  }
  if (!patient_id || !admin_id || !test_name) {
    return res.status(400).json({ error: 'Faltan campos (patient_id, admin_id, test_name).' });
  }

  const doctorIdOrNull = doctor_id || null;
  const appointmentIdOrNull = appointment_id || null;

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'healthtrack_lab_results',
      resource_type: 'auto'
    });

    const file_url = result.secure_url;
    const file_name_original = req.file.originalname;
    const file_type = result.format; 

    const query = `
      INSERT INTO lab_results 
        (patient_id, admin_id, test_name, description, file_url, file_name, file_type, doctor_id, appointment_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    const newResult = await pool.query(query, [
      patient_id, admin_id, test_name, description, 
      file_url, file_name_original, file_type, 
      doctorIdOrNull, appointmentIdOrNull
    ]);

    res.status(201).json(newResult.rows[0]);
  
  } catch (err) {
    console.error('Error al subir resultado de lab:', err.message);
    res.status(500).json({ error: 'Error en el servidor al subir el archivo.' });
  }
});

app.post('/api/admin/create-invoice', async (req, res) => {
    const { user_id, amount, description, appointment_id } = req.body;
    const amountInCents = parseInt(amount, 10); 
    
    if (!user_id || !amountInCents || !description) {
      return res.status(400).json({ error: 'user_id, amount (en centavos) y description son requeridos.' });
    }
  
    try {
      const query = `
        INSERT INTO invoices (user_id, amount, description, status, appointment_id)
        VALUES ($1, $2, $3, 'pending', $4)
        RETURNING *
      `;
      const newInvoice = await pool.query(query, [user_id, amountInCents, description, appointment_id || null]);
      res.status(201).json(newInvoice.rows[0]);
    } catch (err) {
      console.error('Error al crear factura:', err.message);
      res.status(500).json({ error: 'Error en el servidor.' });
    }
  });
  
  app.get('/api/admin/all-invoices', async (req, res) => {
      try {
          const query = `
              SELECT i.*, pp.nombres, pp.primer_apellido
              FROM invoices i
              LEFT JOIN patient_profiles pp ON i.user_id = pp.user_id
              ORDER BY i.id DESC
          `;
          const result = await pool.query(query);
          res.json(result.rows);
      } catch (err) {
          console.error('Error al obtener todas las facturas:', err.message);
          res.status(500).json({ error: 'Error en el servidor.' });
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
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  const selectedDateStr = date; 
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const selectedDate = new Date(selectedDateStr + 'T00:00:00');
  
  if (selectedDate < today) {
    return res.status(400).json({ error: 'No se pueden crear horarios en una fecha pasada.' });
  }

  const client = await pool.connect();
  try {
    const existingSlotsQuery = `
      SELECT COUNT(*) 
      FROM appointments 
      WHERE doctor_id = $1 
      AND DATE(appointment_time) = $2 
      AND status = 'disponible';
    `;
    const existingSlotsResult = await client.query(existingSlotsQuery, [doctor_id, selectedDateStr]);
    const count = parseInt(existingSlotsResult.rows[0].count, 10);

    if (count > 0) {
      return res.status(409).json({ error: 'Ya existen horarios disponibles para este médico en esta fecha. Elimine los existentes primero.' });
    }

    await client.query('BEGIN');
    
    const startDateTime = new Date(`${selectedDateStr}T${startTime}:00Z`); 
    const endDateTime = new Date(`${selectedDateStr}T${endTime}:00Z`);
    const intervalMinutes = parseInt(interval, 10);

    if (endDateTime <= startDateTime) {
         await client.query('ROLLBACK');
         return res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio.' });
    }

    for (let currentTime = new Date(startDateTime); currentTime < endDateTime; currentTime.setUTCMinutes(currentTime.getUTCMinutes() + intervalMinutes)) {
      
      const appointment_time_iso = currentTime.toISOString(); 
      const currentHour = currentTime.getUTCHours();
      if (currentHour < parseInt(startTime.split(':')[0]) || currentHour >= parseInt(endTime.split(':')[0])) {
          continue; 
      }

      const query = "INSERT INTO appointments (doctor_id, appointment_time, sede, status, appointment_type) VALUES ($1, $2, $3, 'disponible', 'general')";
      await client.query(query, [parseInt(doctor_id, 10), appointment_time_iso, sede]);
    }
    
    await client.query('COMMIT');
    res.status(201).json({ message: 'Horarios generados exitosamente.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Backend] Error al crear horarios en lote:', err.message);
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
    const query = `
      SELECT 
        a.id, 
        a.appointment_time, 
        a.sede, 
        a.status,
        u.username as doctor_name, 
        dp.nombres as doctor_nombres, 
        dp.primer_apellido as doctor_apellido, 
        dp.especialidad
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE DATE(a.appointment_time) = $1 
      AND a.appointment_time > NOW()
      ORDER BY a.appointment_time ASC;
    `;
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener horarios para la fecha:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/my-appointments/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = `
      SELECT a.id, a.appointment_time, a.sede, a.status, a.description, dp.nombres as doctor_nombres, dp.primer_apellido as doctor_apellido, dp.especialidad
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE a.patient_id = $1 
        AND a.appointment_time >= NOW()
        AND a.status = 'agendada' 
      ORDER BY a.appointment_time ASC
    `;
    const result = await pool.query(query, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mis citas:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.put('/api/appointments/book/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id, description } = req.body;
  try {
    const query = "UPDATE appointments SET patient_id = $1, status = 'agendada', description = $2 WHERE id = $3 AND status = 'disponible' RETURNING *";
    const updatedAppointment = await pool.query(query, [patient_id, description, id]);
    if (updatedAppointment.rows.length === 0) return res.status(404).json({ error: 'La cita no está disponible o no existe.' });
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

app.get('/api/doctor/my-appointments/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    const query = `
      SELECT 
        a.id, 
        a.patient_id,
        a.appointment_time, 
        a.sede, 
        a.status, 
        pp.nombres AS patient_nombres, 
        pp.primer_apellido AS patient_apellido, 
        pp.numero_cedula AS patient_cedula 
      FROM appointments a
      INNER JOIN patient_profiles pp ON a.patient_id = pp.user_id 
      WHERE a.doctor_id = $1 
        AND a.status = 'agendada'
      ORDER BY a.appointment_time ASC;
    `;
    const result = await pool.query(query, [doctorId]);
    res.json(result.rows);
  } catch (err) {
    console.error('[Backend] Error al obtener citas del médico (sin filtro tiempo):', err.message);
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


// --- Rutas del Módulo de Pacientes del Doctor ---
app.get('/api/doctor/patients/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'El parámetro de búsqueda "query" es requerido.' });
  }
  try {
    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await pool.query(
      `SELECT
          u.id AS user_id,
          u.username,
          pp.nombres,
          pp.primer_apellido,
          pp.segundo_apellido,
          pp.numero_cedula
        FROM users u
        JOIN patient_profiles pp ON u.id = pp.user_id
        WHERE u.role = 'usuario' AND (
            LOWER(pp.nombres) LIKE $1 OR
            LOWER(pp.primer_apellido) LIKE $1 OR
            LOWER(pp.segundo_apellido) LIKE $1 OR
            LOWER(pp.numero_cedula) LIKE $1 OR
            LOWER(u.username) LIKE $1
        )
        ORDER BY pp.nombres ASC`,
      [searchQuery]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Backend] Error al buscar pacientes:', err.message);
    res.status(500).json({ error: 'Error interno del servidor al buscar pacientes.' });
  }
});

app.get('/api/doctor/patients/:patientId/profile', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT
          u.id AS user_id,
          u.username,
          pp.*
        FROM users u
        JOIN patient_profiles pp ON u.id = pp.user_id
        WHERE u.id = $1 AND u.role = 'usuario'`,
      [patientId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`[Backend] Error al obtener perfil del paciente ${patientId}:`, err.message);
    res.status(500).json({ error: 'Error interno del servidor al obtener el perfil del paciente.' });
  }
});

app.get('/api/doctor/patients/:patientId/lab-results', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = "SELECT * FROM lab_results WHERE patient_id = $1 ORDER BY created_at DESC";
    const results = await pool.query(query, [patientId]);
    res.json(results.rows);
  } catch (err) {
    console.error('Error al obtener resultados del paciente (doctor):', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});


// --- Rutas del Módulo de Historiales Clínicos ---
app.get('/api/doctor/patients/:patientId/medical-records', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM medical_records
        WHERE patient_id = $1
        ORDER BY fecha_creacion DESC`,
      [patientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(`[Backend] Error al obtener historiales del paciente ${patientId}:`, err.message);
    res.status(500).json({ error: 'Error interno del servidor al obtener historiales.' });
  }
});

app.post('/api/doctor/patients/:patientId/medical-records', async (req, res) => {
  const { patientId } = req.params;
  const { doctorId, appointment_id, motivo_consulta, registro, sexo, edad, habitacion, ocupacion,
    antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares,
    antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes,
    antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos,
    antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones,
    antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique,
    antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo,
    antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones,
    antecedentes_no_patologicos_otros, observaciones_generales
  } = req.body;

  if (!doctorId || !motivo_consulta) {
      return res.status(400).json({ error: 'El ID del Doctor y el Motivo de Consulta son campos obligatorios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO medical_records (
        patient_id, doctor_id, appointment_id, motivo_consulta, registro, sexo, edad, habitacion, ocupacion,
        antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares,
        antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes,
        antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos,
        antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones,
        antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique,
        antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo,
        antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones,
        antecedentes_no_patologicos_otros, observaciones_generales
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        patientId, doctorId, appointment_id, motivo_consulta, registro, sexo, edad, habitacion, ocupacion,
        antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares,
        antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes,
        antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos,
        antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones,
        antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique,
        antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo,
        antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones,
        antecedentes_no_patologicos_otros, observaciones_generales
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(`[Backend] Error al crear historial para paciente ${patientId}:`, err.message);
    res.status(500).json({ error: 'Error interno del servidor al crear el historial.' });
  }
});

app.put('/api/doctor/patients/:patientId/medical-records/:recordId', async (req, res) => {
  const { patientId, recordId } = req.params;
  const { doctorId, motivo_consulta, registro, sexo, edad, habitacion, ocupacion,
    antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares,
    antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes,
    antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos,
    antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones,
    antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique,
    antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo,
    antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones,
    antecedentes_no_patologicos_otros, observaciones_generales
  } = req.body;

  if (!doctorId) return res.status(401).json({ error: 'ID de Doctor requerido para actualizar el historial.' });

  try {
    const result = await pool.query(
      `UPDATE medical_records SET
        motivo_consulta = $1, registro = $2, sexo = $3, edad = $4, habitacion = $5, ocupacion = $6,
        antecedentes_patologicos_cardiovasculares = $7, antecedentes_patologicos_pulmonares = $8,
        antecedentes_patologicos_digestivos = $9, antecedentes_patologicos_diabetes = $10,
        antecedentes_patologicos_renales = $11, antecedentes_patologicos_quirurgicos = $12,
        antecedentes_patologicos_alergicos = $13, antecedentes_patologicos_transfusiones = $14,
        antecedentes_patologicos_medicamentos = $15, antecedentes_patologicos_especifique = $16,
        antecedentes_no_patologicos_alcohol = $17, antecedentes_no_patologicos_tabaquismo = $18,
        antecedentes_no_patologicos_drogas = $19, antecedentes_no_patologicos_inmunizaciones = $20,
        antecedentes_no_patologicos_otros = $21, observaciones_generales = $22
        WHERE id = $23 AND patient_id = $24 AND doctor_id = $25
        RETURNING *`,
      [
        motivo_consulta, registro, sexo, edad, habitacion, ocupacion,
        antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares,
        antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes,
        antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos,
        antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones,
        antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique,
        antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo,
        antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones,
        antecedentes_no_patologicos_otros, observaciones_generales,
        recordId, patientId, doctorId
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historial clínico no encontrado o no autorizado para actualizar.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`[Backend] Error al actualizar historial ${recordId} para paciente ${patientId}:`, err.message);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el historial.' });
  }
});

app.put('/api/doctor/appointments/:appointmentId/finish', async (req, res) => {
  const { appointmentId } = req.params;
  const { doctorId } = req.body; 

  if (!doctorId) return res.status(401).json({ error: 'ID de Doctor requerido para finalizar la cita.' });

  try {
    const result = await pool.query(
      `UPDATE appointments
        SET status = 'finalizada'
        WHERE id = $1 AND doctor_id = $2
        RETURNING *`,
      [appointmentId, doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada para finalizar.' });
    }

    res.json({ message: 'Cita finalizada con éxito.', appointment: result.rows[0] });
  } catch (err) {
    console.error(`[Backend] Error al finalizar cita ${appointmentId}:`, err.message);
    res.status(500).json({ error: 'Error interno del servidor al finalizar la cita.' });
  }
});

// (PACIENTE) Crea una sesión de pago de Stripe para una factura PENDIENTE
app.post('/api/billing/create-checkout-session/:invoiceId', async (req, res) => {
    const { invoiceId } = req.params;
  
    try {
      const invoiceResult = await pool.query("SELECT * FROM invoices WHERE id = $1", [invoiceId]);
      if (invoiceResult.rows.length === 0) {
        return res.status(404).json({ error: 'Factura no encontrada.' });
      }
      const invoice = invoiceResult.rows[0];
  
      if (invoice.status === 'paid') {
        return res.status(400).json({ error: 'Esta factura ya ha sido pagada.' });
      }
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'cop',
              product_data: {
                name: invoice.description,
              },
              unit_amount: invoice.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        client_reference_id: invoice.id, 
        success_url: `${process.env.FRONTEND_URL}/user/mis-facturas?payment=success`, 
        cancel_url: `${process.env.FRONTEND_URL}/user/mis-facturas?payment=cancelled`, 
      });
  
      // --- ¡ESTE ES EL CAMBIO CLAVE! ---
      // Devolvemos la 'url' completa, no solo el 'id'
      res.json({ url: session.url }); 
  
    } catch (err) {
      console.error('Error al crear sesión de checkout:', err.message);
      res.status(500).json({ error: 'Error en el servidor.' });
    }
  });


// --- INICIAR SERVIDOR ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});