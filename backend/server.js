const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // Herramienta para encriptar contraseñas

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de la conexión a la base de datos
// Usa la llave secreta (DATABASE_URL) que configuraste en Render
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


// --- RUTA DE REGISTRO ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Encripta la contraseña antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserta el nuevo usuario en la tabla 'users'
    const newUserQuery = "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
    const newUser = await pool.query(newUserQuery, [username, hashedPassword]);
    
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error('Error en el registro:', err.message);
    res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
  }
});


// --- RUTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  try {
    // Busca al usuario por su nombre de usuario
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" }); // No des pistas si es el usuario o la contraseña
    }

    const user = userResult.rows[0];

    // Compara la contraseña enviada con la encriptada en la base de datos
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    res.json({ message: "Login exitoso" });
    // En un futuro, aquí generarías y enviarías un token (JWT) para mantener la sesión abierta

  } catch (err) {
    console.error('Error en el login:', err.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});