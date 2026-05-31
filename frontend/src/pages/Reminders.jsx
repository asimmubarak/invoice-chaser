import { useEffect, useState } from 'react'
import { getReminders, approveReminder, cancelReminder, sendReminder } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react'
import axios from 'axios'

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const userId = localStorage.getItem('user_id')

  const load = async () => {
    const res = await getReminders(userId)
    setReminders(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const runReminders = async () => {
    setRunning(true)
    try {
      const res = await axios.post('https://invoice-chaser-production.up.railway.app/run-reminders')
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

  const handle = async (fn, id, msg) => {
    try {
      await fn(id)
      toast.success(msg)
      load()
    } catch {
      toast.error('Action failed')
    }
  }

  return (
    <div style={{ background: '#13131f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', margin: '0 0 4px' }}>Reminders queue</h2>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
              Reminders auto-generate daily at 9am. Click below to check now.
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
        ) : reminders.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>No pending reminders</p>
            <p style={{ color: '#555', fontSize: '13px' }}>
              Click "Check for reminders" to scan your overdue invoices.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reminders.map(r => (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '24px' }}>
                    <button
                      onClick={() => handle(approveReminder, r.id, 'Approved!')}
                      style={{ ...actionBtn, background: '#064e3b', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handle(sendReminder, r.id, 'Sent!')}
                      style={{ ...actionBtn, background: '#1e3a5f', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Send size={14} /> Send now
                    </button>
                    <button
                      onClick={() => handle(cancelReminder, r.id, 'Cancelled')}
                      style={{ ...actionBtn, background: '#450a0a', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const cardStyle = { background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '12px', padding: '24px' }
const actionBtn = { border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }