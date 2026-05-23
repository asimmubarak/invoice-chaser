import { useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, Mail, Upload } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#13131f', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #2e2e3e' }}>
        <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '20px' }}>Invoice Chaser</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/login')} style={ghostBtn}>Log in</button>
          <button onClick={() => navigate('/login')} style={primaryBtn}>Start free trial</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ display: 'inline-block', background: '#2e2e3e', color: '#a78bfa', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', marginBottom: '24px' }}>
          Built for freelancers & small businesses
        </div>
        <h1 style={{ fontSize: '52px', fontWeight: 700, margin: '0 0 20px', lineHeight: 1.15 }}>
          Stop chasing clients.<br />
          <span style={{ color: '#a78bfa' }}>Let us do it for you.</span>
        </h1>
        <p style={{ color: '#888', fontSize: '18px', maxWidth: '540px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          Invoice Chaser automatically detects overdue invoices and sends smart, human-sounding payment reminders — so you get paid without the awkward follow-up emails.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{ ...primaryBtn, fontSize: '16px', padding: '14px 32px' }}>
            Start free trial — no credit card
          </button>
          <button onClick={() => navigate('/login')} style={{ ...ghostBtn, fontSize: '16px', padding: '14px 32px' }}>
            See how it works
          </button>
        </div>
        <p style={{ color: '#555', fontSize: '13px', marginTop: '16px' }}>14-day free trial · $29/month after · Cancel anytime</p>
      </div>

      {/* Pain points */}
      <div style={{ background: '#1a1a2e', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '8px' }}>Sound familiar?</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '48px' }}>Every freelancer deals with this. You shouldn't have to.</p>
        <div style={{ display: 'flex', gap: '24px', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { text: '"I hate writing follow-up emails — I don\'t want to damage the relationship"' },
            { text: '"30% of my clients don\'t pay on time and I spend hours chasing them"' },
            { text: '"I forget to follow up and then it\'s been 3 months and the invoice is ancient"' },
          ].map((q, i) => (
            <div key={i} style={{ background: '#13131f', border: '1px solid #2e2e3e', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '240px', maxWidth: '280px' }}>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>{q.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '48px' }}>Everything you need to get paid faster</h2>
        <div style={{ display: 'flex', gap: '24px', maxWidth: '900px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Clock size={24} color="#a78bfa" />, title: 'Automatic overdue detection', desc: 'Checks your invoices daily and flags anything overdue. No manual tracking.' },
            { icon: <Mail size={24} color="#a78bfa" />, title: 'Smart reminder drafts', desc: 'Gentle nudge at day 3. Firmer at day 10. Urgent at day 20. Human-sounding, every time.' },
            { icon: <CheckCircle size={24} color="#a78bfa" />, title: 'You approve before it sends', desc: 'Nothing goes out without your review. Stay in control, save the time.' },
            { icon: <Upload size={24} color="#a78bfa" />, title: 'Scan any invoice', desc: 'Upload a PDF or photo. AI reads it and fills in all the details automatically.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: '12px', padding: '28px', flex: '1', minWidth: '200px', maxWidth: '210px' }}>
              <div style={{ marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ background: '#1a1a2e', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Simple pricing</h2>
        <p style={{ color: '#888', marginBottom: '48px' }}>One plan. Everything included.</p>
        <div style={{ background: '#1e1e2e', border: '2px solid #a78bfa', borderRadius: '16px', padding: '40px', maxWidth: '380px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#a78bfa' }}>$29</div>
          <div style={{ color: '#888', marginBottom: '32px' }}>per month</div>
          {[
            'Unlimited invoices',
            'Unlimited clients',
            'Automatic reminder engine',
            'AI invoice scanner',
            'Email delivery included',
            '14-day free trial',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', textAlign: 'left' }}>
              <CheckCircle size={16} color="#34d399" />
              <span style={{ fontSize: '14px', color: '#ccc' }}>{f}</span>
            </div>
          ))}
          <button onClick={() => navigate('/login')} style={{ ...primaryBtn, width: '100%', marginTop: '24px', padding: '14px', fontSize: '15px' }}>
            Start free trial
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px', borderTop: '1px solid #2e2e3e', color: '#555', fontSize: '13px' }}>
        © 2026 Invoice Chaser · Built for freelancers who deserve to get paid on time
      </div>

    </div>
  )
}

const primaryBtn = {
  background: '#a78bfa',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px'
}

const ghostBtn = {
  background: 'none',
  border: '1px solid #3e3e4e',
  borderRadius: '8px',
  padding: '10px 20px',
  color: '#ccc',
  cursor: 'pointer',
  fontSize: '14px'
} 
