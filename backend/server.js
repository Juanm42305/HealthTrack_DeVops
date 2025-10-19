// Contenido COMPLETO y DEFINITIVO para backend/server.js

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

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: "Perfil de paciente no encontrado." });
    }
    res.json(profile.rows[0]);
  } catch (err) {
    console.error('Error al obtener perfil:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

app.put('/api/profile/patient/:userId', async (req, res) => {
  const { userId } = req.params;
  const { nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula } = req.body;

  try {
    const query = `
      UPDATE patient_profiles
      SET nombres = $1, primer_apellido = $2, segundo_apellido = $3, edad = $4, fecha_nacimiento = $5, numero_cedula = $6
      WHERE user_id = $7
      RETURNING *
    `;
    const values = [nombres, primer_apellido, segundo_apellido, edad, fecha_nacimiento, numero_cedula, userId];
    const updatedProfile = await pool.query(query, values);

    if (updatedProfile.rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado para actualizar." });
    }
    res.json(updatedProfile.rows[0]);
  } catch (err) {
    console.error('Error al actualizar perfil:', err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});


// --- RUTAS DE ADMINISTRADOR ---
// ... (Aquí puedes pegar el resto de tus rutas de admin y citas si las tenías en otro archivo)


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});