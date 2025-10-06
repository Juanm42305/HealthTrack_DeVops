import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/inicio");
  };

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5",
    },
    form: {
      background: "white",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
      textAlign: "center",
      width: "300px",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "8px",
    },
    button: {
      padding: "10px",
      background: "#4f46e5",
      color: "white",
      fontSize: "1rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      width: "100%",
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        <h2>🔐 Iniciar Sesión</h2>
        <input type="text" placeholder="Usuario" required style={styles.input} />
        <input type="password" placeholder="Contraseña" required style={styles.input} />
        <button type="submit" style={styles.button}>Ingresar</button>
      </form>
    </div>
  );
}

export default Login;
