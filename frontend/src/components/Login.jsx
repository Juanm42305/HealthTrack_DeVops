import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// No importamos CSS aquí porque ya lo maneja WelcomePage.css o los estilos en línea

function Login() {
  // true = Modo Login, false = Modo Registro
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Cambia el endpoint según el modo
    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); 

      if (response.ok) {
        if (isLoginMode) {
          // === LOGIN EXITOSO ===
          login(data.user); 
          navigate('/dashboard');
          console.log(`[HealthTrack LOG] Usuario ${username} inició sesión exitosamente.`);
        } else {
          // === REGISTRO EXITOSO ===
          alert("✅ Cuenta creada correctamente. Iniciando sesión...");
          // Truco: Autologuear después de registrar si el backend devuelve el usuario
          // Si no, cambiamos a modo login:
          setIsLoginMode(true); 
          setPassword(""); 
        }
      } else {
        alert(`Error: ${data.error || 'Ocurrió un problema'}`);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="auth-form-content" style={{width: '100%', animation: 'fadeIn 0.5s'}}>
      
      <h2 style={{marginBottom: '0.5rem', color: '#333'}}>
        {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h2>
      <p style={{marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem'}}>
        {isLoginMode ? 'Bienvenido de nuevo' : 'Únete a HealthTrack hoy'}
      </p>
      
      <form onSubmit={handleSubmit} style={{width: '100%'}}>
        <div style={{marginBottom: '1rem'}}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de Usuario"
            required
            style={inputStyle}
          />
        </div>
        
        <div style={{marginBottom: '1.5rem'}}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            style={inputStyle}
          />
        </div>

        <button 
          type="submit"
          style={isLoginMode ? loginButtonStyle : registerButtonStyle}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isLoginMode ? 'ENTRAR' : 'REGISTRARSE'}
        </button>
      </form>

      <div style={{marginTop: '1.5rem', fontSize: '0.9rem', color: '#555'}}>
        {isLoginMode ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <span 
          onClick={toggleMode} 
          style={{
            color: '#E67E22', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            textDecoration: 'underline'
          }}
        >
          {isLoginMode ? "Regístrate aquí" : "Inicia sesión"}
        </span>
      </div>

    </div>
  );
}

// --- Estilos en línea para mantener todo encapsulado ---
const inputStyle = {
  width: '100%',
  padding: '12px 20px',
  borderRadius: '50px',
  border: '1px solid #e0e0e0',
  backgroundColor: '#f9f9f9',
  outline: 'none',
  boxSizing: 'border-box',
  fontSize: '1rem',
  transition: 'border-color 0.3s'
};

const loginButtonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '50px',
  border: 'none',
  backgroundColor: '#E67E22', /* Naranja */
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(230, 126, 34, 0.3)',
  transition: 'transform 0.2s, background-color 0.2s'
};

const registerButtonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '50px',
  border: 'none',
  backgroundColor: '#2C3E50', /* Azul Oscuro */
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(44, 62, 80, 0.3)',
  transition: 'transform 0.2s, background-color 0.2s'
};

export default Login;