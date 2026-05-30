import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../services/api'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    getDashboard(userId)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={loadingStyle}>Loading...</div>

  const { summary, overdue_invoices } = data

  return (
    <div style={{ background: '#13131f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: '24px' }}>Dashboard</h2>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatCard
            label="Total owed"
            value={`$ ${summary.total_owed.toLocaleString()}`}
            color="#a78bfa"
          />
          <StatCard
            label="Overdue"
            value={`$ ${summary.total_overdue.toLocaleString()}`}
            color="#f87171"
          />
          <StatCard
            label="Total paid"
            value={`$ ${summary.total_paid.toLocaleString()}`}
            color="#34d399"
          />
          <StatCard
            label="Pending reminders"
            value={summary.pending_reminders}
            color="#fbbf24"
          />
        </div>

        {/* Overdue invoices */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#fff', margin: 0 }}>Overdue invoices</h3>
            <button onClick={() => navigate('/invoices')} style={linkBtnStyle}>
              View all
            </button>
          </div>

          {overdue_invoices.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No overdue invoices 🎉</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e2e3e' }}>
                  {['Client', 'Invoice', 'Amount', 'Days overdue'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdue_invoices.map((inv, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #2e2e3e' }}>
                    <td style={tdStyle}>{inv.client}</td>
                    <td style={tdStyle}>{inv.invoice_number}</td>
                    <td style={tdStyle}>{inv.currency} {inv.amount.toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#f87171', fontWeight: 600 }}>
                      {inv.days_overdue} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const loadingStyle = {
  background: '#13131f',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888'
}

const cardStyle = {
  background: '#1e1e2e',
  border: '1px solid #2e2e3e',
  borderRadius: '12px',
  padding: '24px'
}

const thStyle = {
  color: '#888',
  fontSize: '12px',
  textAlign: 'left',
  padding: '8px 12px',
  textTransform: 'uppercase'
}

const tdStyle = {
  color: '#ccc',
  fontSize: '14px',
  padding: '12px'
}

const linkBtnStyle = {
  background: 'none',
  border: '1px solid #2e2e3e',
  color: '#a78bfa',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px'
}