import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboardData } from '../lib/supabase'

const STATUS_DOT = {
  completed: { background: '#22c55e' },
  in_progress: { background: '#f59e0b' },
  upcoming: { background: '#d1d5db' },
  cancelled: { background: '#ef4444' },
}

const SVC_COLORS = ['#E91E8C', '#6366f1', '#f59e0b', '#22c55e', '#8b5cf6']

export default function Dashboard({ branch, branches, currentUser }) {
  const isAdmin = currentUser?.role === 'admin'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [branch])

  const load = async () => {
    setLoading(true)
    const d = await getDashboardData(branch || 'all')
    setData(d)
    setLoading(false)
  }

  const branchName = branch === 'all' || !branch ? 'Sab Branches' : (branches.find(b => b.id === branch)?.name || 'Sab Branches')
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading dashboard...</div></div></div>

  const maxBranch = Math.max(...(data.branchWise.map(b => b.revenue)), 1)
  const maxSvc = Math.max(...(data.topServices.map(s => s.revenue)), 1)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">{today} — {branchName}</div>
        </div>
        <span className="badge badge-success">● {branches.length} Branches Live</span>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">Aaj Ki Kamai</div>
          <div className="metric-value">₹{data.todayRevenue.toLocaleString('en-IN')}</div>
          <div className="metric-change up">Paid invoices se aaj</div>
        </div>
        <div className="metric">
          <div className="metric-label">Aaj Appointments</div>
          <div className="metric-value">{data.todayApptsCount}</div>
          <div className="metric-change up">Aaj book hue</div>
        </div>
        <div className="metric">
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{data.totalCustomers.toLocaleString('en-IN')}</div>
          <div className="metric-change up">Database mein</div>
        </div>
        {isAdmin && (
          <div className="metric">
            <div className="metric-label">Is Mahine Revenue</div>
            <div className="metric-value">₹{data.monthRevenue.toLocaleString('en-IN')}</div>
            <div className="metric-change up">Net Profit: ₹{data.netProfit.toLocaleString('en-IN')}</div>
          </div>
        )}
      </div>

      {isAdmin && <div className="grid-60-40 mb-24">
        <div className="card">
          <div className="card-title">Branch-wise Revenue (Is Mahine)</div>
          {data.branchWise.every(b => b.revenue === 0) ? (
            <div className="empty-state" style={{ padding: 30 }}><div className="text-muted">Abhi koi revenue nahi — invoices banao</div></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.branchWise} layout="vertical" barSize={20}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-title">Top Services (Is Mahine)</div>
          {data.topServices.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}><div className="text-muted">Abhi koi data nahi</div></div>
          ) : (
            data.topServices.map((s, i) => (
              <div key={s.name} style={{ marginBottom: 14 }}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{s.name}</span>
                  <span className="mono fw-600" style={{ fontSize: 13 }}>₹{s.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: 6, background: '#f0ebf8', borderRadius: 3 }}>
                  <div style={{ height: 6, width: `${(s.revenue / maxSvc) * 100}%`, background: SVC_COLORS[i % SVC_COLORS.length], borderRadius: 3 }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>}

      <div className="card">
        <div className="card-title">
          Aaj Ke Appointments (Live)
          <span className="badge badge-info">{data.todayApptsList.length} total</span>
        </div>
        {data.todayApptsList.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}><div className="empty-icon">📅</div><div className="text-muted">Aaj koi appointment nahi</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Status</th><th>Time</th><th>Customer</th><th>Service</th><th>Staff</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {data.todayApptsList.map((a) => (
                <tr key={a.id}>
                  <td><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', ...(STATUS_DOT[a.status] || STATUS_DOT.upcoming) }}></span></td>
                  <td className="text-muted">{a.appointment_time}</td>
                  <td className="fw-600">{a.customers?.name || 'Unknown'}</td>
                  <td className="text-muted">{a.services?.name || '—'}</td>
                  <td>{a.staff?.name || '—'}</td>
                  <td className="mono">₹{Number(a.final_amount || a.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
