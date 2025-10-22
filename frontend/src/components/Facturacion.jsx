// Contenido COMPLETO para frontend/src/components/Facturacion.jsx

import React, { useState, useEffect } from 'react';
import './Facturacion.css'; // Crearemos este CSS

function Facturacion() {
  const [users, setUsers] = useState([]); // Para la lista de pacientes
  const [invoices, setInvoices] = useState([]); // Para la lista de facturas
  
  // Cargar pacientes y facturas al inicio
  useEffect(() => {
    // ... (Aquí iría la lógica para cargar usuarios y facturas existentes)
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const target = e.target;
    const amount = parseInt(target.amount.value, 10);
    const description = target.description.value;
    const user_id = target.user_id.value;

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/billing/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, amount, description }),
      });
      if (response.ok) {
        alert('¡Factura creada! El paciente ya puede verla para pagar.');
      } else {
        alert('Error al crear la factura.');
      }
    } catch (error) {
      alert('Error de red.');
    }
  };

  return (
    <div className="facturacion-page">
      <h1>Facturación y Reportes</h1>
      
      <div className="form-container">
        <h2>Crear Nueva Factura de Pago Único</h2>
        <form onSubmit={handleCreateInvoice}>
          <div className="form-group">
            <label>Paciente</label>
            {/* Idealmente, aquí se carga la lista de usuarios */}
            <input name="user_id" placeholder="ID del Usuario (ej. 1)" required />
          </div>
          <div className="form-group">
            <label>Monto (en COP, ej: 95000)</label>
            <input name="amount" type="number" placeholder="95000" required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input name="description" placeholder="Ej: Cirugía de rodilla" required />
          </div>
          <button type="submit" className="btn-save">Crear Factura</button>
        </form>
      </div>

      <div className="report-container">
        <h2>Reportes (Próximamente)</h2>
        {/* Aquí iría la lista de facturas */}
      </div>
    </div>
  );
}

export default Facturacion;