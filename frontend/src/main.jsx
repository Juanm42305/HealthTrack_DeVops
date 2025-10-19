// En frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Importamos el AuthProvider
import { MedicoProvider } from './context/MedicoContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MedicoProvider> {/* <-- ¡ENVUELVE LA APP AQUÍ! */}
          <App />
        </MedicoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);