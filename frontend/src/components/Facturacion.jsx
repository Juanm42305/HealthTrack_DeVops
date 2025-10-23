// Contenido COMPLETO y ACTUALIZADO para frontend/src/components/Facturacion.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // ¡IMPORTADO!
import './Facturacion.css'; 

function Facturacion() {
  const [users, setUsers] = useState([]); 
  const [invoices, setInvoices] = useState([]); 
  
  useEffect(() => {
    // ... 
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
        // ¡CAMBIO!
        Swal.fire('¡Éxito!', '¡Factura creada! El paciente ya puede verla para pagar.', 'success');
        e.target.reset(); // Limpia el formulario
      } else {
        // ¡CAMBIO!
        Swal.fire('Error', 'Error al crear la factura.', 'error');
      }
    } catch (error) {
      // ¡CAMBIO!
      Swal.fire('Error', 'Error de red.', 'error');
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
      </div>
    </div>
  );
}

export default Facturacion;