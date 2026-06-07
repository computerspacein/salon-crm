import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getBillItemsReport, getBranches } from '../lib/supabase'

const COLORS = ['#E91E8C', '#6366f1', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316']

const RANGES = [
  { key: '7', label: 'Last 7 din' },
  { key: '30', label: 'Last 30 din' },
  { key: '90', label: 'Last 3 mahine' },
  { key: 'all', label: 'All Time' },
]

export default function Reports({ branch }) {
  const [items, setItems] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('30')
  const [branchFilter, setBranchFilter] = useState('all')

  useEffect(() => { load() }, [range])

  const load = async () => {
    setLoading(true)
    let fromDate = null
    if (range !== 'all') {
      const d = new Date()
      d.setDate(d.getDate() - Number(range))
      fromDate = d.toISOString().slice(0, 10)
    }
    const [it, br] = await Promise.all([getBillItemsReport(fromDate), getBranches()])
    setItems(it.data || [])
    setBranches(br.data || [])
    setLoading(false)
  }

  // Branch filter
  const filtered = branchFilter === 'all' ? items : items.filter(i => i.branch_id === branchFilter)

  // Service-wise aggregation
  const svcMap = {}
  filtered.forEach(i => {
    const key = i.service_name
    if (!svcMap[key]) svcMap[key] = { name: key, count: 0, revenue: 0 }
    svcMap[key].count++
    svcMap[key].revenue += Number(i.price || 0)
  })
  const services = Object.values(svcMap).sort((a, b) => b.count - a.count)

  // Branch-wise revenue
  const branchMap = {}
  filtered.forEach(i => {
    const key = i.branches?.name || 'Unknown'
    if (!branchMap[key]) branchMap[key] = { name: key, count: 0, revenue: 0 }
    branchMap[key].count++
    branchMap[key].revenue += Number(i.price || 0)
  })
  const branchData = Object.values(branchMap).sort((a, b) => b.revenue - a.revenue)

  const totalServices = filtered.length
  const totalRevenue = filtered.reduce((s, i) => s + Number(i.price || 0), 0)
  const uniqueServices = services.length

  const topServicesChart = services.slice(0, 8)

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading reports...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Service Reports</div><div className="page-sub">Kaunsi service kitni chali — analytics</div></div>
      </div>

      <div className="filter-bar">
        <select className="select" value={range} onChange={e => setRange(e.target.value)}>
          {RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select className="select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">Sab Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="metric"><div className="metric-label">Total Services Bechi</div><div className="metric-value">{totalServices}</div></div>
        <div className="metric"><div className="metric-label">Total Revenue (Quick Bills)</div><div className="metric-value">₹{totalRevenue.toLocaleString('en-IN')}</div></div>
        <div className="metric"><div className="metric-label">Different Services</div><div className="metric-value">{uniqueServices}</div></div>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📊</div><div>Is period mein koi bill nahi.<br/><small className="text-muted">Quick Billing se bills banao — yahan analytics aayenge!</small></div></div></div>
      ) : (
        <>
          <div className="grid-60-40 mb-24">
            <div className="card">
              <div className="card-title">Top Services (Count)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topServicesChart} layout="vertical" barSize={18}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip formatter={(v, n) => n === 'count' ? [`${v} baar`, 'Count'] : v} />
                  <Bar dataKey="count" fill="#E91E8C" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-title">Branch-wise Revenue</div>
              {branchData.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={branchData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                      {branchData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Detailed Service Breakdown</div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>#</th><th>Service</th><th>Kitni Baar</th><th>Total Revenue</th><th>Avg Price</th></tr></thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.name}>
                      <td className="text-muted mono">{i + 1}</td>
                      <td className="fw-600">{s.name}</td>
                      <td className="mono">{s.count}</td>
                      <td className="mono fw-600 text-success">₹{s.revenue.toLocaleString('en-IN')}</td>
                      <td className="mono text-muted">₹{Math.round(s.revenue / s.count).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
