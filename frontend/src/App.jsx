// Contenido para frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ProtectedRoute from './context/ProtectedRoute'; // <-- ¡ESTA ES LA RUTA CORRECTA! // Importamos el guardia
import { useAuth } from './context/AuthContext'; // Importamos el hook

function App() {
  const { isAuthenticated, logout } = useAuth(); // Obtenemos el estado y la función de logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirigimos al login después de cerrar sesión
  };

  return (
    <div>
      {/* --- MENÚ DE NAVEGACIÓN INTELIGENTE --- */}
      {isAuthenticated && (
        <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <Link to="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/profile" style={{ color: 'white', marginRight: '1rem' }}>Perfil</Link>
          <button onClick={handleLogout} style={{ float: 'right' }}>Cerrar Sesión</button>
        </nav>
      )}

      {/* --- RUTAS DE LA APLICACIÓN --- */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Privadas (Protegidas por el guardia) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;