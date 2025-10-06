import React from 'react'
import ReactDOM from 'react-dom/client'
import Login from './components/Login.jsx'
import './index.css' // opcional, si tienes estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>,
)