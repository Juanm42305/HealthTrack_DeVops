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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});