import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 1. Convertimos la función a 'async' para poder usar 'await'
  const handleRegister = async (e) => {
    e.preventDefault();

    // 2. Obtenemos la URL de la API desde las variables de entorno de Vercel
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      // 3. Hacemos la llamada a la API del backend con 'fetch'
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST', // Usamos el método POST para enviar datos
        headers: {
          'Content-Type': 'application/json', // Le decimos que enviaremos JSON
        },
        body: JSON.stringify({ username, password }), // Convertimos los datos a un string JSON
      });

      if (response.ok) {
        // Si la respuesta es exitosa (ej. status 201)
        alert("✅ Usuario registrado correctamente. Ahora inicia sesión.");
        navigate("/"); // Redirigimos al login
      } else {
        // Si el backend devuelve un error (ej. usuario ya existe)
        const errorData = await response.json();
        alert(`Error al registrar: ${errorData.error || 'Intenta de nuevo'}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor. Revisa tu conexión.");
    }
  };

  return (
    <div className="register-container">
      {/* ... Tu JSX del formulario sigue igual ... */}
      <div className="register-card">
        <h1>💙 HealthTrack</h1>
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Crea un nombre de usuario"
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crea una contraseña"
              required
            />
          </div>
          <button type="submit" className="register-btn">Registrarme</button>
        </form>
        <p className="login-link">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;