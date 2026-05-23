export default function StatCard({ label, value, color = '#a78bfa' }) {
  return (
    <div style={{
      background: '#1e1e2e',
      border: '1px solid #2e2e3e',
      borderRadius: '12px',
      padding: '24px',
      flex: 1
    }}>
      <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>{label}</div>
      <div style={{ color, fontSize: '28px', fontWeight: 700 }}>{value}</div>
    </div>
  )
}