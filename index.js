import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Login de prueba
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Esto es solo de ejemplo, después puedes conectar con DB
  if (email === "admin@hospital.com" && password === "1234") {
    return res.json({ success: true, message: "✅ Login exitoso" });
  } else {
    return res.status(401).json({ success: false, message: "❌ Credenciales incorrectas" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
