// Contenido completo para frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DashboardDispatcher from './components/DashboardDispatcher'; // ¡El nuevo despachador!
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {isAuthenticated && (
        <nav style={{ padding: '1rem', background: '#333', color: 'white' }}>
          <Link to="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/profile" style={{ color: 'white', marginRight: '1rem' }}>Perfil</Link>
          <button onClick={handleLogout} style={{ float: 'right' }}>Cerrar Sesión</button>
        </nav>
      )}

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Privadas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardDispatcher /> {/* ¡Usamos el despachador aquí! */}
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