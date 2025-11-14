import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaArrowLeft, FaChartPie, FaChartBar, FaMoneyBillWave } from 'react-icons/fa';
import './AdminReportes.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AdminReportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        try {
            const res = await fetch(`${apiUrl}/api/admin/analytics`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error("Error cargando analíticas", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAnalytics();
  }, []);

  const goBack = () => navigate(-1);

  if (loading) return <div className="loading-container">Generando reportes...</div>;
  if (!data) return <div>No hay datos disponibles.</div>;

  // Preparamos datos para gráficas
  const appointmentsData = data.appointments.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: parseInt(item.count)
  }));

  const financeData = data.finances.map(item => ({
      name: item.status === 'paid' ? 'Pagadas' : 'Pendientes',
      total: parseInt(item.total_amount) / 100, // Convertir centavos a pesos
      count: parseInt(item.count)
  }));

  // Calcular Total Recaudado
  const totalRecaudado = financeData
    .filter(d => d.name === 'Pagadas')
    .reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="reportes-page">
      <header className="main-header">
        <button onClick={goBack} className="back-button"><FaArrowLeft /> Volver</button>
      </header>

      <div className="reportes-container">
        <h1>Panel de Analíticas y Reportes</h1>
        
        {/* Tarjetas de Resumen */}
        <div className="kpi-grid">
            <div className="kpi-card">
                <div className="icon-box blue"><FaMoneyBillWave /></div>
                <div>
                    <h3>Total Recaudado</h3>
                    <p>${totalRecaudado.toLocaleString('es-CO')}</p>
                </div>
            </div>
            <div className="kpi-card">
                <div className="icon-box green"><FaChartPie /></div>
                <div>
                    <h3>Total Citas</h3>
                    <p>{appointmentsData.reduce((a, b) => a + b.value, 0)}</p>
                </div>
            </div>
        </div>

        {/* Gráficas */}
        <div className="charts-grid">
            
            {/* Gráfica de CITAS (Pie Chart) */}
            <div className="chart-box">
                <h3>Estado de las Citas</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={appointmentsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {appointmentsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfica de DINERO (Bar Chart) */}
            <div className="chart-box">
                <h3>Finanzas: Pagado vs Pendiente</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="total" name="Monto Total (COP)" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>

        {/* Tabla de Top Médicos */}
        <div className="top-doctors-section">
            <h3>Top Médicos (Más Citas Finalizadas)</h3>
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Citas Atendidas</th>
                    </tr>
                </thead>
                <tbody>
                    {data.topDoctors.map((doc, idx) => (
                        <tr key={idx}>
                            <td>Dr. {doc.nombres} {doc.primer_apellido}</td>
                            <td>{doc.total_citas}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}

export default AdminReportes;