import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MedicoProvider } from './context/MedicoContext';
// --- SENTRY (Sintaxis Nueva) ---
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://ce51fec0879ea623358c9e9e12413375@o4510301797810176.ingest.de.sentry.io/4510302518247504",
  integrations: [
    // Antes era: new Sentry.BrowserTracing(...) -> AHORA ES ASÍ:
    Sentry.browserTracingIntegration(),
    // Antes era: new Sentry.Replay() -> AHORA ES ASÍ:
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
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