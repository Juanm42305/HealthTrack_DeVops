// Contenido COMPLETO y MODIFICADO para frontend/src/components/Login.jsx
// (Con el console.log para Vercel Logs)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (event) => {
    event.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); 

      if (response.ok) {
        login(data.user); 
        navigate('/dashboard'); 
        
        console.log(`[HealthTrack LOG] Usuario ${username} inició sesión exitosamente.`);
        
      } else {
        alert(`Error: ${data.error || 'Usuario o contraseña incorrectos'}`);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="login-overlay"> 
      <div className="login-container"> 
        <div className="login-logo">
          <span>💙</span> HealthTrack
        </div>
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />
          <button type="submit">Entrar</button>
        </form>
        <div className="login-footer">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;