// Contenido MODERNO para frontend/src/components/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Link ya no es necesario aquí
import { useAuth } from "../context/AuthContext";
// El CSS de Login ya no es necesario porque WelcomePage.css maneja los estilos
// import "./Login.css"; 

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
        
        // Log para Vercel Observability
        console.log(`[HealthTrack LOG] Usuario ${username} inició sesión exitosamente.`);
        
      } else {
        alert(`Error: ${data.error || 'Usuario o contraseña incorrectos'}`);
      }
    } catch (error) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="login-form-content">
      {/* El título y el avatar ya están en WelcomePage, aquí solo va el form */}
      <h2 style={{marginBottom: '1.5rem', color: '#333'}}>Iniciar Sesión</h2>
      
      <form onSubmit={handleLogin} style={{width: '100%'}}>
        <div style={{marginBottom: '1rem'}}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '50px',
              border: '1px solid #ddd',
              backgroundColor: '#f9f9f9',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{marginBottom: '1.5rem'}}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '50px',
              border: '1px solid #ddd',
              backgroundColor: '#f9f9f9',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button 
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '50px',
            border: 'none',
            backgroundColor: '#E67E22', /* Naranja moderno */
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(230, 126, 34, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          ENTRAR
        </button>
      </form>
    </div>
  );
}

export default Login;