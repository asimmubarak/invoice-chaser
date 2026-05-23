import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Bell, LogOut } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    navigate('/')
  }

  return (
    <nav style={{
      background: '#1e1e2e',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      borderBottom: '1px solid #2e2e3e'
    }}>
      <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '18px' }}>
        Invoice Chaser
      </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        <NavLink to="/app" icon={<LayoutDashboard size={16} />} label="Dashboard" />
        <NavLink to="/invoices" icon={<FileText size={16} />} label="Invoices" />
        <NavLink to="/clients" icon={<Users size={16} />} label="Clients" />
        <NavLink to="/reminders" icon={<Bell size={16} />} label="Reminders" />
      </div>

      <button onClick={logout} style={{
        background: 'none',
        border: '1px solid #3e3e4e',
        color: '#888',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px'
      }}>
        <LogOut size={14} /> Logout
      </button>
    </nav>
  )
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} style={{
      color: '#ccc',
      textDecoration: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'background 0.2s'
    }}
    onMouseEnter={e => e.currentTarget.style.background = '#2e2e3e'}
    onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {icon} {label}
    </Link>
  )
}