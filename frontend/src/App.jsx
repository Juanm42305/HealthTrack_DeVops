import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Inicio from "./components/Inicio";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const handleLogin = (username, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userFound = users.find(
      (user) => user.username === username && user.password === password
    );

    if (userFound) {
      setIsAuthenticated(true);
      setCurrentUser(username);
      localStorage.setItem("currentUser", username);
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    localStorage.removeItem("currentUser");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/inicio" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/inicio"
          element={
            isAuthenticated ? (
              <Inicio username={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
