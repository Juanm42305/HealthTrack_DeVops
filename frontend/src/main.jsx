import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MedicoProvider } from './context/MedicoContext';
// --- INTEGRACIÓN DE SENTRY ---
import * as Sentry from "@sentry/react";

Sentry.init({

  dsn: "https://ce51fec0879ea623358c9e9e12413375@o4510301797810176.ingest.de.sentry.io/4510302518247504",
  
  integrations: [
    new Sentry.BrowserTracing({
      // Esto permite que Sentry rastree errores entre tu frontend y tu backend en Render
      tracePropagationTargets: ["localhost", "https://healthtrack-backend-ce70.onrender.com"],
    }),
    new Sentry.Replay(),
  ],
  
  // Configuración de rendimiento y grabación de sesiones
  tracesSampleRate: 1.0, // Captura el 100% de las transacciones para pruebas
  replaysSessionSampleRate: 0.1, // Graba el 10% de las sesiones normales
  replaysOnErrorSampleRate: 1.0, // Graba el 100% de las sesiones cuando ocurre un error
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MedicoProvider>
          <App />
        </MedicoProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);