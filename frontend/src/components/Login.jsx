import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Asumo que tienes un CSS para el login, si no, puedes crearlo
// import "./Login.css"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 1. Convertimos la función a 'async'
  const handleLogin = async (event) => {
    event.preventDefault();

    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      // 2. Hacemos la llamada al endpoint de login del backend
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Si el login es exitoso
        console.log("Login exitoso, redirigiendo al dashboard...");
        navigate('/dashboard'); // Redirigimos al dashboard
      } else {
        // Si el backend dice que las credenciales son incorrectas
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Usuario o contraseña incorrectos'}`);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    // He mejorado un poco tu formulario para que sea funcional
    <div className="login-container"> {/* Usa clases para estilizar */}
      <div className="login-card">
        <h1>💙 HealthTrack</h1>
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <button type="submit" className="login-btn">Entrar</button>
        </form>
        <p className="register-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;