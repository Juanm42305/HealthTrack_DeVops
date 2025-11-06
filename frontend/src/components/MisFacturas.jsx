// Contenido COMPLETO y CORREGIDO para frontend/src/components/MisFacturas.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
// ¡YA NO NECESITAMOS loadStripe!
import { FaFileInvoiceDollar, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import './MisFacturas.css';

function MisFacturas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const goBack = () => navigate(-1);

  // Muestra alertas de éxito o error si Stripe redirige aquí
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      Swal.fire('¡Pago Exitoso!', 'Tu pago ha sido procesado correctamente.', 'success');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    }
    if (searchParams.get('payment') === 'cancelled') {
      Swal.fire('Pago Cancelado', 'El pago fue cancelado. Puedes intentarlo de nuevo.', 'warning');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Cargar las facturas del paciente
  useEffect(() => {
    if (!user?.id) return;

    const fetchInvoices = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/patient/${user.id}/my-invoices`);
        if (response.ok) {
          setInvoices(await response.json());
        } else {
          Swal.fire('Error', 'No se pudieron cargar tus facturas.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Error de conexión al cargar facturas.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [user]);

  // --- ¡LÓGICA DE PAGO CORREGIDA! ---
  const handlePayment = async (invoiceId) => {
    setLoadingPayment(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      // 1. Pedir la URL de pago al backend
      const response = await fetch(`${apiUrl}/api/billing/create-checkout-session/${invoiceId}`, {
        method: 'POST',
      });
      
      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.error || 'No se pudo iniciar el pago.');
      }
      
      // 2. Redirigir al checkout de Stripe (¡Sin usar stripe.js!)
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("No se recibió URL de pago.");
      }

    } catch (error) {
      Swal.fire('Error de Pago', error.message, 'error');
      setLoadingPayment(false);
    }
  };
  
  const formatCurrency = (cents) => {
    const amount = cents / 100;
    return amount.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
  };

  if (loading) {
    return (
        <div className="mis-facturas-page">
            <div className="mis-facturas-container">
                <h1>Cargando tus facturas...</h1>
            </div>
        </div>
    );
  }

  return (
    <div className="mis-facturas-page">
      <header className="main-header">
        <button onClick={goBack} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </header>

      <div className="mis-facturas-container">
        <h1>Mis Facturas</h1>
        {invoices.length === 0 ? (
          <p className="no-facturas-text">No tienes facturas pendientes ni pagadas.</p>
        ) : (
          <div className="facturas-list">
            {invoices.map((invoice) => (
              <div key={invoice.id} className={`factura-card ${invoice.status}`}>
                <div className="factura-icon">
                  {invoice.status === 'pending' ? <FaExclamationTriangle /> : <FaCheckCircle />}
                </div>
                <div className="factura-details">
                  <h4>{invoice.description}</h4>
                  <p>Monto: <strong>{formatCurrency(invoice.amount)}</strong></p>
                  <span className="factura-date">ID: {invoice.id}</span>
                </div>
                <div className="factura-action">
                  {invoice.status === 'pending' ? (
                    <button 
                      className="btn-pagar" 
                      onClick={() => handlePayment(invoice.id)}
                      disabled={loadingPayment}
                    >
                      {loadingPayment ? 'Cargando...' : 'Pagar Ahora'}
                    </button>
                  ) : (
                    <span className="status-paid">Pagada</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisFacturas;