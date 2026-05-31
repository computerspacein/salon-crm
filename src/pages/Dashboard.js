import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const revenueData = [
  { day: 'Mon', revenue: 38000 }, { day: 'Tue', revenue: 52000 },
  { day: 'Wed', revenue: 44000 }, { day: 'Thu', revenue: 61000 },
  { day: 'Fri', revenue: 78000 }, { day: 'Sat', revenue: 92000 },
  { day: 'Sun', revenue: 48250 },
]

const branchData = [
  { name: 'Sec 17', revenue: 280000 },
  { name: 'Sec 35', revenue: 210000 },
  { name: 'Mohali', revenue: 240000 },
  { name: 'Panchkula', revenue: 190000 },
]

const APPOINTMENTS = [
  { time: '9:30 AM', customer: 'Priya Sharma', service: 'Hair Color + Cut', staff: 'Ritu', amount: 1800, status: 'completed' },
  { time: '10:00 AM', customer: 'Meena Gupta', service: 'Facial + Waxing', staff: 'Sima', amount: 950, status: 'completed' },
  { time: '11:15 AM', customer: 'Sunita Rani', service: 'Bridal Trial', staff: 'Ritu', amount: 3500, status: 'in_progress' },
  { time: '12:00 PM', customer: 'Anita Verma', service: 'Keratin Treatment', staff: 'Neha', amount: 2200, status: 'upcoming' },
  { time: '1:30 PM', customer: 'Kavita Singh', service: 'Mani + Pedi', staff: 'Sima', amount: 650, status: 'upcoming' },
  { time: '2:45 PM', customer: 'Renu Bhatia', service: 'Hair Spa', staff: 'Neha', amount: 1100, status: 'upcoming' },
]

const STATUS_BADGE = {
  completed: <span className="badge badge-success">Done</span>,
  in_progress: <span className="badge badge-warning">In Progress</span>,
  upcoming: <span className="badge badge-info">Upcoming</span>,
}

const STATUS_DOT = {
  completed: { background: '#22c55e' },
  in_progress: { background: '#f59e0b' },
  upcoming: { background: '#d1d5db' },
}

export default function Dashboard() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Sunday, 31 May 2026 — Sab Branches</div>
        </div>
        <span className="badge badge-success">● 4 Branches Live</span>
      </div>

      <div className="metrics-grid">
        {[
          { label: 'Aaj Ki Kamai', value: '₹48,250', change: '↑ 12% kal se zyada', up: true },
          { label: 'Aaj Appointments', value: '67', change: '↑ 8 walk-ins bhi', up: true },
          { label: 'Total Customers', value: '3,842', change: '↑ 24 naye is hafte', up: true },
          { label: 'Is Mahine Revenue', value: '₹9.2L', change: '↓ 3% pichle mahine se', up: false },
        ].map(m => (
          <div className="metric" key={m.label}>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-change ${m.up ? 'up' : 'down'}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-60-40 mb-24">
        <div className="card">
          <div className="card-title">Is Hafte Ka Revenue</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="revenue" fill="#E91E8C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">Branch-wise Revenue (Is Mahine)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={branchData} layout="vertical" barSize={16}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-60-40">
        <div className="card">
          <div className="card-title">
            Aaj Ke Appointments (Live)
            <span className="badge badge-warning">12 Pending</span>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Status</th><th>Time</th><th>Customer</th><th>Service</th><th>Staff</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {APPOINTMENTS.map((a, i) => (
                <tr key={i}>
                  <td><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', ...STATUS_DOT[a.status] }}></span></td>
                  <td className="text-muted">{a.time}</td>
                  <td className="fw-600">{a.customer}</td>
                  <td className="text-muted">{a.service}</td>
                  <td>{a.staff}</td>
                  <td className="mono">₹{a.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">Top Services (Is Mahine)</div>
          {[
            { name: 'Hair Color', pct: 90, revenue: '₹2.1L', color: '#E91E8C' },
            { name: 'Bridal Package', pct: 65, revenue: '₹1.4L', color: '#6366f1' },
            { name: 'Facial/Cleanup', pct: 48, revenue: '₹88K', color: '#f59e0b' },
            { name: 'Waxing', pct: 38, revenue: '₹72K', color: '#22c55e' },
            { name: 'Keratin/Hair Spa', pct: 30, revenue: '₹60K', color: '#8b5cf6' },
          ].map(s => (
            <div key={s.name} style={{ marginBottom: 14 }}>
              <div className="flex-between" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{s.name}</span>
                <span className="mono fw-600" style={{ fontSize: 13 }}>{s.revenue}</span>
              </div>
              <div style={{ height: 6, background: '#f0ebf8', borderRadius: 3 }}>
                <div style={{ height: 6, width: `${s.pct}%`, background: s.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
