import { useEffect, useState } from 'react'
import { getInvoices, getClients, createClient, createInvoice, markPaid, deleteInvoice, scanInvoice } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Upload, Plus, CheckCircle, Trash2 } from 'lucide-react'

const emptyForm = {
  client_id: '', invoice_number: '', amount: '',
  currency: 'PKR', due_date: '', notes: ''
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [showNewClient, setShowNewClient] = useState(false)
  const userId = localStorage.getItem('user_id')

  const load = async () => {
    const [inv, cli] = await Promise.all([
      getInvoices(userId),
      getClients(userId)
    ])
    setInvoices(inv.data)
    setClients(cli.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleScan = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await scanInvoice(fd)
      const ext = res.data.extracted

      // Try to match scanned name against existing clients
      const matched = clients.find(c =>
        c.name.toLowerCase() === (ext.client_name || '').toLowerCase()
      )

      if (matched) {
        setForm({
          client_id: matched.id,
          invoice_number: ext.invoice_number || '',
          amount: ext.amount || '',
          currency: ext.currency || 'PKR',
          due_date: ext.due_date || '',
          notes: ext.notes || ''
        })
        setShowNewClient(false)
      } else {
        // Client not found — show new client creation fields pre-filled
        setForm({
          client_id: '',
          invoice_number: ext.invoice_number || '',
          amount: ext.amount || '',
          currency: ext.currency || 'PKR',
          due_date: ext.due_date || '',
          notes: ext.notes || ''
        })
        setNewClientName(ext.client_name || '')
        setNewClientEmail(ext.client_email || '')
        setShowNewClient(true)
      }

      setShowForm(true)
      toast.success('Invoice scanned — please review and confirm')
    } catch {
      toast.error('Scan failed. Please fill in manually.')
      setShowForm(true)
    }
    setScanning(false)
  }

  const handleSubmit = async () => {
    let clientId = form.client_id

    // If new client needs to be created first
    if (showNewClient && !clientId) {
      if (!newClientName) {
        toast.error('Please enter client name')
        return
      }
      try {
        const res = await createClient({
          name: newClientName,
          email: newClientEmail || '',
          phone: '',
          company: ''
        }, userId)
        clientId = res.data[0].id
        toast.success(`Client "${newClientName}" created`)
        await load()
      } catch {
        toast.error('Failed to create client')
        return
      }
    }

    if (!clientId || !form.invoice_number || !form.amount || !form.due_date) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createInvoice({ ...form, client_id: clientId, amount: parseFloat(form.amount) }, userId)
      toast.success('Invoice created!')
      setForm(emptyForm)
      setNewClientName('')
      setNewClientEmail('')
      setShowNewClient(false)
      setShowForm(false)
      load()
    } catch {
      toast.error('Failed to create invoice')
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await markPaid(id)
      toast.success('Marked as paid!')
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return
    try {
      await deleteInvoice(id)
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
          <h2 style={{ color: '#fff', margin: 0 }}>Invoices</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ ...btnStyle, background: '#2e2e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {scanning ? 'Scanning...' : <><Upload size={14} /> Scan invoice</>}
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleScan} style={{ display: 'none' }} />
            </label>
            <button onClick={() => { setShowForm(!showForm); setShowNewClient(false) }} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} /> Add manually
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', margin: '0 0 16px' }}>
              {scanning ? 'Reviewing scanned invoice' : 'New invoice'}
            </h3>

            {/* New client section — shown when scanned client not found */}
            {showNewClient && (
              <div style={{ background: '#13131f', border: '1px solid #a78bfa', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#a78bfa', fontSize: '13px', margin: '0 0 12px' }}>
                  New client detected — will be created automatically
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    placeholder="Client name *"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    placeholder="Client email"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Existing client dropdown — shown when not creating new */}
            {!showNewClient && (
              <div style={{ marginBottom: '12px' }}>
                <select
                  value={form.client_id}
                  onChange={e => setForm({ ...form, client_id: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  <option value="">Select client *</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                placeholder="Invoice number *"
                value={form.invoice_number}
                onChange={e => setForm({ ...form, invoice_number: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Amount *"
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={inputStyle}
              />
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                style={inputStyle}
              >
                {['PKR', 'USD', 'GBP', 'EUR', 'AED', 'INR'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                placeholder="Due date *"
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, gridColumn: '1 / -1' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={handleSubmit} style={btnStyle}>Save invoice</button>
              <button onClick={() => {
                setShowForm(false)
                setForm(emptyForm)
                setNewClientName('')
                setNewClientEmail('')
                setShowNewClient(false)
              }} style={{ ...btnStyle, background: '#2e2e3e' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Invoice list */}
        <div style={cardStyle}>
          {loading ? (
            <p style={{ color: '#888' }}>Loading...</p>
          ) : invoices.length === 0 ? (
            <p style={{ color: '#888', fontSize: '14px' }}>No invoices yet. Add one or scan a PDF.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e2e3e' }}>
                  {['Client', 'Invoice #', 'Amount', 'Due date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #2e2e3e' }}>
                    <td style={tdStyle}>{inv.clients?.name}</td>
                    <td style={tdStyle}>{inv.invoice_number}</td>
                    <td style={tdStyle}>{inv.currency} {inv.amount?.toLocaleString()}</td>
                    <td style={tdStyle}>{inv.due_date}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: inv.status === 'paid' ? '#064e3b' : '#450a0a',
                        color: inv.status === 'paid' ? '#34d399' : '#f87171'
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {inv.status === 'unpaid' && (
                          <button onClick={() => handleMarkPaid(inv.id)} style={iconBtnStyle} title="Mark paid">
                            <CheckCircle size={16} color="#34d399" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(inv.id)} style={iconBtnStyle} title="Delete">
                          <Trash2 size={16} color="#f87171" />
                        </button>
                      </div>
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