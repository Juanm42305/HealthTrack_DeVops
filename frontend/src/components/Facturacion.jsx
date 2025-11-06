// Contenido COMPLETO y FUNCIONAL para frontend/src/components/Facturacion.jsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Facturacion.css'; // Asegúrate de tener este CSS

function Facturacion() {
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar todas las facturas
  const fetchAllInvoices = async () => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/all-invoices`);
      if (response.ok) {
        setAllInvoices(await response.json());
      } else {
        Swal.fire('Error', 'No se pudo cargar el reporte de facturas.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de red al cargar facturas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convertir 109.900 a 10990000 (en centavos)
    const amountInCents = parseInt(amount.replace(/\./g, ''), 10) * 100;

    if (isNaN(amountInCents)) {
        Swal.fire('Error', 'El monto no es válido. Escribe 109.900 (COP).', 'error');
        setIsSubmitting(false);
        return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/admin/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            user_id: parseInt(userId, 10), 
            amount: amountInCents, // Enviamos en centavos
            description 
        }),
      });
      
      if (response.ok) {
        Swal.fire('¡Éxito!', 'Factura creada. El paciente ya puede verla para pagar.', 'success');
        // Limpiar formulario y recargar
        setUserId('');
        setAmount('');
        setDescription('');
        fetchAllInvoices(); // Recargar la tabla
      } else {
        const err = await response.json();
        Swal.fire('Error', `Error al crear la factura: ${err.error}`, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de red.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // Función para formatear de centavos (10990000) a $109.900,00 COP
  const formatCurrency = (cents) => {
    const amount = cents / 100;
    return amount.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
  };

  return (
    <div className="facturacion-page">
      <h1>Facturación y Reportes</h1>
      
      <div className="facturacion-grid">
        {/* Columna 1: Crear Factura */}
        <div className="form-container">
          <h2>Crear Factura Manual (Para Cirugías/Otros)</h2>
          <form onSubmit={handleCreateInvoice}>
            <div className="form-group">
              <label>ID del Paciente (User ID)</label>
              <input 
                name="user_id" 
                type="number"
                placeholder="Ej: 1" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Monto (en COP, ej: 109.900)</label>
              <input 
                name="amount" 
                type="text" 
                placeholder="109.900" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input 
                name="description" 
                placeholder="Ej: Cirugía de rodilla" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Factura'}
            </button>
          </form>
        </div>

        {/* Columna 2: Reporte de Facturas */}
        <div className="report-container">
          <h2>Reporte General de Facturas</h2>
          {loading ? <p>Cargando reporte...</p> : (
            <table className="facturacion-table">
              <thead>
                <tr>
                  <th>ID Factura</th>
                  <th>Paciente</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {allInvoices.length === 0 ? (
                  <tr><td colSpan="5">No hay facturas generadas.</td></tr>
                ) : (
                  allInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{invoice.nombres || 'Usuario'} {invoice.primer_apellido || `(ID: ${invoice.user_id})`}</td>
                      <td>{invoice.description}</td>
                      <td>{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span className={`invoice-status status-${invoice.status}`}>
                          {invoice.status === 'pending' ? 'Pendiente' : 'Pagada'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Facturacion;