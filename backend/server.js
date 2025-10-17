const express = require('express');
const cors = require('cors'); // ¡Importante para la comunicación!
const app = express();

// Render te dará un puerto, úsalo. Si no, usa el 3001 para pruebas locales.
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite que tu frontend en Vercel se comunique con este backend
app.use(express.json()); // Permite que el servidor entienda JSON

// Una ruta de prueba para saber que el servidor funciona
app.get('/api', (req, res) => {
  res.json({ message: "¡Hola desde el backend en Render!" });
});

// Aquí irán tus rutas para registrar usuarios, login, etc.
// Ejemplo: app.post('/api/register', (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
