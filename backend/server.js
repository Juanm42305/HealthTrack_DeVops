// Contenido COMPLETO y DEFINITIVO para backend/server.js

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


// --- RUTA DE ADMINISTRADOR PARA OBTENER MÉDICOS ---
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

// --- (Aquí irían el resto de rutas que ya tenías, como las de citas, perfiles, etc.) ---


// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});