import React from 'react';
// 1. Importa el hook useNavigate
import { useNavigate } from 'react-router-dom';

function Login() {
  // 2. Llama al hook para obtener la función de navegación
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página

    // --- Aquí iría tu lógica para verificar el usuario y la contraseña ---
    // Por ahora, vamos a simular un login exitoso.

    const loginFueExitoso = true; // Simulación

    if (loginFueExitoso) {
      // 3. Si el login es exitoso, redirige al dashboard
      console.log("Login exitoso, redirigiendo al dashboard...");
      navigate('/dashboard');
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Iniciar Sesión</h2>
      {/* Tus inputs de email y contraseña aquí */}
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;