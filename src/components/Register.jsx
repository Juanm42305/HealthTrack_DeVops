import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find((u) => u.username === username);

    if (exists) {
      alert("El usuario ya existe, elige otro nombre.");
      return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Usuario registrado correctamente");
    navigate("/");
  };

  return (
    <div className="register-container">
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
