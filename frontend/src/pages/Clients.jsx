import { useEffect, useState } from 'react'
import { getClients, createClient, deleteClient } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

const emptyForm = { name: '', email: '', phone: '', company: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const userId = localStorage.getItem('user_id')

  const load = async () => {
    const res = await getClients(userId)
    setClients(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required')
      return
    }
    try {
      await createClient(form, userId)
      toast.success('Client added!')
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch {
      toast.error('Failed to add client')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this client?')) return
    try {
      await deleteClient(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div style={{ background: '#13131f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>Clients</h2>
          <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add client
          </button>
        </div>

        {showForm && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', margin: '0 0 16px' }}>New client</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder="Full name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
              <input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={btnStyle}>Save client</button>
              <button onClick={() => { setShowForm(false); setForm(emptyForm) }} style={{ ...btnStyle, background: '#2e2e3e' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={cardStyle}>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : clients.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No clients yet. Add your first client.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e2e3e' }}>
                  {['Name', 'Email', 'Phone', 'Company', ''].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #2e2e3e' }}>
                    <td style={tdStyle}>{c.name}</td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={tdStyle}>{c.phone || '—'}</td>
                    <td style={tdStyle}>{c.company || '—'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(c.id)} style={iconBtnStyle}>
                        <Trash2 size={16} color="#f87171" />
                      </button>
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

const cardStyle = { background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '12px', padding: '24px' }
const inputStyle = { background: '#13131f', border: '1px solid #2e2e3e', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', width: '100%', boxSizing: 'border-box' }
const btnStyle = { background: '#a78bfa', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }
const thStyle = { color: '#888', fontSize: '12px', textAlign: 'left', padding: '8px 12px', textTransform: 'uppercase' }
const tdStyle = { color: '#ccc', fontSize: '14px', padding: '12px' }