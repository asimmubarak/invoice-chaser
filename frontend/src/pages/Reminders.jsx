import { useEffect, useState } from 'react'
import { approveReminder, cancelReminder, sendReminder } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react'
import axios from 'axios'

const API = 'https://invoice-chaser-production.up.railway.app'

export default function Reminders() {
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const userId = localStorage.getItem('user_id')

  const load = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${API}/invoices/reminders?user_id=${userId}`),
        axios.get(`${API}/invoices/reminders-approved?user_id=${userId}`)
      ])
      setPending(Array.isArray(pendingRes.data) ? pendingRes.data : [])
      setApproved(Array.isArray(approvedRes.data) ? approvedRes.data : [])
    } catch {
      setPending([])
      setApproved([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const runReminders = async () => {
    setRunning(true)
    try {
      const res = await axios.post(`${API}/run-reminders`)
      const count = res.data.reminders_created
      if (count > 0) {
        toast.success(`${count} new reminder${count > 1 ? 's' : ''} generated`)
        load()
      } else {
        toast('No new reminders — all invoices are up to date', { icon: '✓' })
      }
    } catch {
      toast.error('Failed to run reminder check')
    }
    setRunning(false)
  }

  const handleApprove = async (id) => {
    try {
      await approveReminder(id)
      toast.success('Approved — ready to send')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  const handleSendNow = async (id) => {
    try {
      await approveReminder(id)
      await axios.post(`${API}/invoices/reminders/${id}/send`)
      toast.success('Reminder sent!')
      load()
    } catch {
      toast.error('Failed to send')
    }
  }

  const handleSendApproved = async (id) => {
    try {
      await axios.post(`${API}/invoices/reminders/${id}/send`)
      toast.success('Reminder sent!')
      load()
    } catch {
      toast.error('Failed to send')
    }
  }

  const handleCancel = async (id) => {
    try {
      await cancelReminder(id)
      toast.success('Cancelled')
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  const ReminderCard = ({ r, actions }) => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
            {r.invoices?.clients?.name} — {r.invoices?.invoice_number}
          </div>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
            {r.invoices?.currency} {r.invoices?.amount?.toLocaleString()} · {r.reminder_day} days overdue
          </div>
          <div style={{
            background: '#13131f',
            border: '1px solid #2e2e3e',
            borderRadius: '8px',
            padding: '12px',
            color: '#ccc',
            fontSize: '13px',
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
            maxWidth: '600px'
          }}>
            {r.message}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions(r)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#13131f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: '0 0 4px' }}>Reminders</h2>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
              Auto-generates daily at 9am · Click to check now
            </p>
          </div>
          <button
            onClick={runReminders}
            disabled={running}
            style={{
              background: '#a78bfa',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: running ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: running ? 0.7 : 1
            }}
          >
            <RefreshCw size={14} />
            {running ? 'Checking...' : 'Check for reminders'}
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#888' }}>Loading...</p>
        ) : (
          <>
            {/* Pending section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ccc', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Pending review ({pending.length})
              </h3>
              {pending.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '32px' }}>
                  <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>No pending reminders</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pending.map(r => (
                    <ReminderCard key={r.id} r={r} actions={(r) => (
                      <>
                        <button
                          onClick={() => handleSendNow(r.id)}
                          style={{ ...actionBtn, background: '#1e3a5f', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Send size={14} /> Send now
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          style={{ ...actionBtn, background: '#064e3b', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          style={{ ...actionBtn, background: '#450a0a', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )} />
                  ))}
                </div>
              )}
            </div>

            {/* Approved section */}
            {approved.length > 0 && (
              <div>
                <h3 style={{ color: '#ccc', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  Approved — ready to send ({approved.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {approved.map(r => (
                    <ReminderCard key={r.id} r={r} actions={(r) => (
                      <>
                        <button
                          onClick={() => handleSendApproved(r.id)}
                          style={{ ...actionBtn, background: '#1e3a5f', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Send size={14} /> Send
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          style={{ ...actionBtn, background: '#450a0a', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </>
                    )} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const cardStyle = { background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '12px', padding: '24px' }
const actionBtn = { border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }