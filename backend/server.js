// Contenido COMPLETO, REPARADO y DEFINITIVO para backend/server.js
// (Incluye: Inicialización automática de Base de Datos, Webhooks, Auth, Citas, Historia Clínica, Facturación, Laboratorio y Analíticas)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const multer = require('multer'); 
const cloudinary = require('cloudinary').v2; 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// --- CONFIGURACIONES ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: 'uploads/' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// CORRECCIÓN DE CORS: Se remueve la barra '/' del final de la URL
app.use(cors({
  origin: 'https://health-track-de-vops-vil3.vercel.app', 
  credentials: true
}));

// --- AUTOMATIZACIÓN DE TABLAS (POSTGRESQL NUEVO EN RENDER) ---
const inicializarBaseDeDatos = async () => {
  try {
    console.log("🔄 Verificando e inicializando tablas en PostgreSQL...");

    // 1. Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'usuario'
      );
    `);

    // 2. Tabla de Perfiles de Paciente
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        nombres VARCHAR(100),
        primer_apellido VARCHAR(100),
        segundo_apellido VARCHAR(100),
        edad INT,
        fecha_nacimiento DATE,
        numero_cedula VARCHAR(50),
        tipo_de_sangre VARCHAR(10),
        direccion_residencia VARCHAR(255),
        avatar_url VARCHAR(255)
      );
    `);

    // 3. Tabla de Perfiles de Médico
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        nombres VARCHAR(100),
        primer_apellido VARCHAR(100),
        segundo_apellido VARCHAR(100),
        edad INT,
        fecha_nacimiento DATE,
        numero_cedula VARCHAR(50),
        especialidad VARCHAR(100),
        consultorio VARCHAR(50),
        sede VARCHAR(100),
        avatar_url VARCHAR(255)
      );
    `);

    // 4. Tabla de Citas (Appointments)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        doctor_id INT REFERENCES users(id) ON DELETE CASCADE,
        patient_id INT REFERENCES users(id) ON DELETE SET NULL,
        appointment_time TIMESTAMP NOT NULL,
        sede VARCHAR(100),
        status VARCHAR(50) DEFAULT 'disponible',
        appointment_type VARCHAR(50) DEFAULT 'general',
        description TEXT
      );
    `);

    // 5. Tabla de Diagnósticos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagnoses (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INT REFERENCES users(id) ON DELETE CASCADE,
        diagnosis_title VARCHAR(255) NOT NULL,
        diagnosis_type VARCHAR(100),
        description TEXT,
        prescription TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Tabla de Resultados de Laboratorio
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lab_results (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES users(id) ON DELETE CASCADE,
        admin_id INT,
        test_name VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(255) NOT NULL,
        file_name VARCHAR(255),
        file_type VARCHAR(50),
        doctor_id INT,
        appointment_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Tabla de Facturas (Invoices)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount INT NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        appointment_id INT,
        stripe_payment_intent_id VARCHAR(255)
      );
    `);

    // 8. Tabla de Historias Clínicas Completas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INT REFERENCES users(id) ON DELETE CASCADE,
        appointment_id INT,
        motivo_consulta TEXT,
        registro TEXT,
        sexo VARCHAR(20),
        edad INT,
        habitacion VARCHAR(50),
        ocupacion VARCHAR(100),
        antecedentes_patologicos_cardiovasculares TEXT,
        antecedentes_patologicos_pulmonares TEXT,
        antecedentes_patologicos_digestivos TEXT,
        antecedentes_patologicos_diabetes TEXT,
        antecedentes_patologicos_renales TEXT,
        antecedentes_patologicos_quirurgicos TEXT,
        antecedentes_patologicos_alergicos TEXT,
        antecedentes_patologicos_transfusiones TEXT,
        antecedentes_patologicos_medicamentos TEXT,
        antecedentes_patologicos_especifique TEXT,
        antecedentes_no_patologicos_alcohol TEXT,
        antecedentes_no_patologicos_tabaquismo TEXT,
        antecedentes_no_patologicos_drogas TEXT,
        antecedentes_no_patologicos_inmunizaciones TEXT,
        antecedentes_no_patologicos_otros TEXT,
        observaciones_generales TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🚀 CREACIÓN DE UN ADMINISTRADOR INICIAL DE PRUEBA (Si no existen usuarios admin)
    const checkAdmin = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(checkAdmin.rows[0].count) === 0) {
      const encryptedPassword = await bcrypt.hash('admin1234', 10);
      await pool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
        ['admin@healthtrack.com', encryptedPassword, 'admin']
      );
      console.log("⭐ Usuario administrador por defecto creado: admin@healthtrack.com / admin1234");
    }

    console.log("✅ ¡Estructura de Base de Datos lista y sincronizada!");
  } catch (error) {
    console.error("❌ Error al inicializar las tablas en Postgres:", error.message);
  }
};

// --- 1. WEBHOOK DE STRIPE (Debe ir ANTES de express.json) ---
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

// Middleware para procesar JSON (para el resto de rutas)
app.use(express.json());

// --- RUTA DE PRUEBA ---
app.get('/api', (req, res) => {
  res.json({ message: "¡Backend de HealthTrack funcionando!" });
});

// --- 2. AUTENTICACIÓN Y USUARIOS ---
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
    
    await client.query("INSERT INTO patient_profiles (user_id) VALUES ($1)", [newUser.id]);
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

// --- 3. PERFILES DE PACIENTE ---
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
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'healthtrack_avatars',
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
    });
    const updated = await pool.query('UPDATE patient_profiles SET avatar_url = $1 WHERE user_id = $2 RETURNING *', [result.secure_url, userId]);
    res.json(updated.rows[0]);
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

app.get('/api/patient/:patientId/my-diagnoses', async (req, res) => {
    const { patientId } = req.params;
    try {
      const result = await pool.query(`SELECT d.*, dp.nombres as doc_nombre, dp.primer_apellido as doc_apellido, dp.especialidad FROM diagnoses d LEFT JOIN doctor_profiles dp ON d.doctor_id = dp.user_id WHERE d.patient_id = $1 ORDER BY d.created_at DESC`, [patientId]);
      res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});


// --- 4. PERFILES Y FUNCIONES DE MÉDICO ---
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
  const { nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, especialidad, consultorio, sede } = req.body;
  try {
    const query = `
      UPDATE doctor_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, 
          fecha_nacimiento = $5, numero_cedula = $6, especialidad = $7, consultorio = $8, sede = $9
      WHERE user_id = $10
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, especialidad, consultorio, sede, userId];
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
    const updated = await pool.query('UPDATE doctor_profiles SET avatar_url = $1 WHERE user_id = $2 RETURNING *', [result.secure_url, userId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error al subir avatar de médico:', err.message);
    res.status(500).json({ error: 'Error en el servidor al subir la imagen.' });
  }
});

app.post('/api/doctor/diagnoses', async (req, res) => {
  const { patient_id, doctor_id, diagnosis_title, diagnosis_type, description, prescription, recommendations } = req.body;
  if (!patient_id || !doctor_id || !diagnosis_title) return res.status(400).json({ error: 'Faltan campos obligatorios.' });

  try {
    const query = `
      INSERT INTO diagnoses (patient_id, doctor_id, diagnosis_title, diagnosis_type, description, prescription, recommendations)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const newDiagnosis = await pool.query(query, [patient_id, doctor_id, diagnosis_title, diagnosis_type, description, prescription, recommendations]);
    res.status(201).json(newDiagnosis.rows[0]);
  } catch (err) {
    console.error('Error al crear diagnóstico:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/doctor/patients/:patientId/diagnoses', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = "SELECT * FROM diagnoses WHERE patient_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener diagnósticos:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});


// --- 5. FUNCIONES DE ADMINISTRADOR ---
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
    await client.query("INSERT INTO doctor_profiles (user_id) VALUES ($1)", [newDoctor.id]);
    await client.query('COMMIT');
    res.status(201).json(newDoctor);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al añadir médico:', err.message);
    res.status(500).json({ error: "Error al añadir médico" });
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
    res.status(500).json({ error: "Error en el servidor" });
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
    if (updatedProfile.rows.length === 0) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar médico:', err.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.delete('/api/admin/doctors/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'medico']);
    if (result.rowCount === 0) return res.status(404).json({ error: "No se encontró el médico" });
    res.json({ message: "Médico eliminado exitosamente." });
  } catch (err) {
    console.error('Error al eliminar médico:', err.message);
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    client.release();
  }
});

app.post('/api/admin/lab-results', upload.single('file'), async (req, res) => {
  const { patient_id, admin_id, test_name, description, doctor_id, appointment_id } = req.body;
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });
  if (!patient_id || !admin_id || !test_name) return res.status(400).json({ error: 'Faltan campos requeridos.' });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'healthtrack_lab_results', resource_type: 'auto' });
    const query = `
      INSERT INTO lab_results 
        (patient_id, admin_id, test_name, description, file_url, file_name, file_type, doctor_id, appointment_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;
    const newResult = await pool.query(query, [patient_id, admin_id, test_name, description, result.secure_url, req.file.originalname, result.format, doctor_id || null, appointment_id || null]);
    res.status(201).json(newResult.rows[0]);
  } catch (err) {
    console.error('Error al subir resultado:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.post('/api/admin/create-invoice', async (req, res) => {
    const { user_id, amount, description, appointment_id } = req.body;
    const amountInCents = parseInt(amount, 10); 
    if (!user_id || !amountInCents || !description) return res.status(400).json({ error: 'Datos incompletos.' });
  
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
        console.error('Error al obtener facturas:', err.message);
        res.status(500).json({ error: 'Error en el servidor.' });
    }
});


// --- 6. GESTIÓN DE CITAS (SCHEDULE) ---
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

app.post('/api/admin/schedule/bulk', async (req, res) => {
  const { doctor_ids, date, startTime, endTime, interval, sede } = req.body;
  if (!doctor_ids || !date || !startTime || !endTime || !interval || !sede) return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const selectedDateStr = date; 
  const startDateTime = new Date(`${selectedDateStr}T${startTime}:00Z`); 
  const endDateTime = new Date(`${selectedDateStr}T${endTime}:00Z`);
  const intervalMinutes = parseInt(interval, 10);

  if (endDateTime <= startDateTime) return res.status(400).json({ error: 'Hora fin debe ser mayor a inicio.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let totalSlots = 0;

    for (const doctor_id of doctor_ids) {
        const existing = await client.query(`
            SELECT COUNT(*) FROM appointments 
            WHERE doctor_id = $1 AND DATE(appointment_time) = $2 AND status = 'disponible'`, 
            [doctor_id, selectedDateStr]
        );
        if (parseInt(existing.rows[0].count) > 0) continue;

        for (let currentTime = new Date(startDateTime); currentTime < endDateTime; currentTime.setUTCMinutes(currentTime.getUTCMinutes() + intervalMinutes)) {
            if (currentTime.getUTCHours() < parseInt(startTime.split(':')[0]) || currentTime.getUTCHours() >= parseInt(endTime.split(':')[0])) continue;
            const appointment_time_iso = currentTime.toISOString();
            await client.query(
                "INSERT INTO appointments (doctor_id, appointment_time, sede, status, appointment_type) VALUES ($1, $2, $3, 'disponible', 'general')",
                [doctor_id, appointment_time_iso, sede]
            );
            totalSlots++;
        }
    }
    await client.query('COMMIT');
    res.status(201).json({ message: `Éxito: ${totalSlots} horarios generados.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error carga masiva:', err.message);
    res.status(500).json({ error: 'Error al generar horarios.' });
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
    console.error('Error al obtener días:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/appointments/available-times/:date', async (req, res) => {
  const { date } = req.params;
  try {
    const query = `
      SELECT a.id, a.appointment_time, a.sede, a.status, u.username as doctor_name, dp.nombres as doctor_nombres, dp.primer_apellido as doctor_apellido, dp.especialidad
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.user_id
      WHERE DATE(a.appointment_time) = $1 AND a.appointment_time > NOW()
      ORDER BY a.appointment_time ASC;
    `;
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener horarios:', err.message);
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
      WHERE a.patient_id = $1 AND a.appointment_time >= NOW() AND a.status = 'agendada' 
      ORDER BY a.appointment_time ASC
    `;
    const result = await pool.query(query, [patientId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error citas paciente:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.put('/api/appointments/book/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id, description } = req.body;
  try {
    const query = "UPDATE appointments SET patient_id = $1, status = 'agendada', description = $2 WHERE id = $3 AND status = 'disponible' RETURNING *";
    const updatedAppointment = await pool.query(query, [patient_id, description, id]);
    if (updatedAppointment.rows.length === 0) return res.status(404).json({ error: 'Cita no disponible.' });
    res.json(updatedAppointment.rows[0]);
  } catch (err) { 
    console.error('Error al agendar:', err.message);
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
    console.error('Error agendar procedimiento:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/doctor/my-appointments/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  try {
    const query = `
      SELECT a.id, a.patient_id, a.appointment_time, a.sede, a.status, pp.nombres AS patient_nombres, pp.primer_apellido AS patient_apellido, pp.numero_cedula AS patient_cedula 
      FROM appointments a
      INNER JOIN patient_profiles pp ON a.patient_id = pp.user_id 
      WHERE a.doctor_id = $1 AND a.status = 'agendada'
      ORDER BY a.appointment_time ASC;
    `;
    const result = await pool.query(query, [doctorId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error citas doctor:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.put('/api/appointments/cancel/:id', async (req, res) => {
  const { id } = req.params;
  const { patient_id } = req.body;
  try {
    const query = "UPDATE appointments SET status = 'disponible', patient_id = NULL WHERE id = $1 AND patient_id = $2 RETURNING *";
    const result = await pool.query(query, [id, patient_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Error al cancelar.' });
    res.json({ message: 'Cita cancelada.' });
  } catch (err) {
    console.error('Error cancelar:', err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/doctor/patients/search', async (req, res) => {
  const { query } = req.query;
  try {
    const q = `%${query.toLowerCase()}%`;
    const result = await pool.query(
      `SELECT u.id AS user_id, u.username, pp.nombres, pp.primer_apellido, pp.segundo_apellido, pp.numero_cedula
       FROM users u JOIN patient_profiles pp ON u.id = pp.user_id
       WHERE u.role = 'usuario' AND (LOWER(pp.nombres) LIKE $1 OR LOWER(pp.primer_apellido) LIKE $1 OR LOWER(pp.numero_cedula) LIKE $1 OR LOWER(u.username) LIKE $1)
       ORDER BY pp.nombres ASC`, [q]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error buscando pacientes.' }); }
});

app.get('/api/doctor/patients/:patientId/profile', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`SELECT u.id AS user_id, u.username, pp.* FROM users u JOIN patient_profiles pp ON u.id = pp.user_id WHERE u.id = $1 AND u.role = 'usuario'`, [patientId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado.' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error perfil paciente.' }); }
});

app.get('/api/doctor/patients/:patientId/lab-results', async (req, res) => {
  const { patientId } = req.params;
  try {
    const query = "SELECT * FROM lab_results WHERE patient_id = $1 ORDER BY created_at DESC";
    const results = await pool.query(query, [patientId]);
    res.json(results.rows);
  } catch (err) { res.status(500).json({ error: "Error servidor." }); }
});

app.get('/api/doctor/patients/:patientId/medical-records', async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY fecha_creacion DESC`, [patientId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Error historial.' }); }
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

  try {
    const result = await pool.query(
      `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, motivo_consulta, registro, sexo, edad, habitacion, ocupacion, antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares, antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes, antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos, antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones, antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique, antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo, antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones, antecedentes_no_patologicos_otros, observaciones_generales) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25) RETURNING *`,
      [patientId, doctorId, appointment_id, motivo_consulta, registro, sexo, edad, habitacion, ocupacion, antecedentes_patologicos_cardiovasculares, antecedentes_patologicos_pulmonares, antecedentes_patologicos_digestivos, antecedentes_patologicos_diabetes, antecedentes_patologicos_renales, antecedentes_patologicos_quirurgicos, antecedentes_patologicos_alergicos, antecedentes_patologicos_transfusiones, antecedentes_patologicos_medicamentos, antecedentes_patologicos_especifique, antecedentes_no_patologicos_alcohol, antecedentes_no_patologicos_tabaquismo, antecedentes_no_patologicos_drogas, antecedentes_no_patologicos_inmunizaciones, antecedentes_no_patologicos_otros, observaciones_generales]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Error creando historial' }); }
});

// COMPLETADO DE ENDPOINT: Cierre correcto de la ruta que estaba cortada
app.put('/api/doctor/patients/:patientId/medical-records/:recordId', async (req, res) => {
    const { recordId } = req.params;
    const { motivo_consulta, observaciones_generales, registro } = req.body; 
    try {
        const query = `
          UPDATE medical_records 
          SET motivo_consulta = $1, observaciones_generales = $2, registro = $3
          WHERE id = $4 RETURNING *
        `;
        const result = await pool.query(query, [motivo_consulta, observaciones_generales, registro, recordId]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Historial no encontrado" });
        res.json(result.rows[0]);
    } catch (err) { 
        console.error("Error actualizando historial:", err.message);
        res.status(500).json({ error: 'Error actualizando historial' }); 
    }
});

// --- INICIALIZACIÓN DEL SERVIDOR ---
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend corriendo exitosamente en el puerto ${PORT}`);
  // Ejecuta la inicialización automática apenas levante el servicio en Render
  await inicializarBaseDeDatos();
});