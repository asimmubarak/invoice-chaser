import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup } from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = async () => {
    setLoading(true)
    try {
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password })
        localStorage.setItem('user_id', res.data.user_id)
        localStorage.setItem('email', res.data.email)
        toast.success('Welcome back!')
        navigate('/app')
      } else {
        await signup(form)
        toast.success('Account created! Please log in.')
        setIsLogin(true)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#13131f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#1e1e2e',
        border: '1px solid #2e2e3e',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#a78bfa', margin: '0 0 8px', fontSize: '24px' }}>
          Invoice Chaser
        </h1>
        <p style={{ color: '#888', margin: '0 0 32px', fontSize: '14px' }}>
          Stop chasing clients manually
        </p>

        {!isLogin && (
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            style={inputStyle}
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && handle()}
        />

        <button onClick={handle} disabled={loading} style={btnStyle}>
          {loading ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
        </button>

        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#a78bfa', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#13131f',
  border: '1px solid #2e2e3e',
  borderRadius: '8px',
  padding: '12px',
  color: '#fff',
  fontSize: '14px',
  marginBottom: '12px',
  boxSizing: 'border-box'
}

const btnStyle = {
  width: '100%',
  background: '#a78bfa',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '4px'
}