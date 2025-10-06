import React from "react";

function Login() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🔐 Iniciar Sesión</h1>
      <form>
        <input type="text" placeholder="Usuario" required /><br /><br />
        <input type="password" placeholder="Contraseña" required /><br /><br />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;
