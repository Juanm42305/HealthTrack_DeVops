import React from 'react';
// 1. Importa los componentes de React Router y tus vistas
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';       // Asumo que ya tienes estos
import Register from './components/Register'; // Asumo que ya tienes estos
import Dashboard from './components/Dashboard'; // La nueva vista
import Profile from './components/Profile';     // La nueva vista

function App() {
  return (
    <div>
      {/* 2. (Opcional) Un menú de navegación simple para probar */}
      <nav>
        <Link to="/">Login</Link> | <Link to="/register">Registrarse</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/profile">Perfil</Link>
      </nav>

      <hr />

      {/* 3. Aquí se define el área donde se renderizarán las rutas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        {/* Puedes añadir todas las rutas que quieras aquí */}
      </Routes>
    </div>
  );
}

export default App;