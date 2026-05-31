import React, { useState } from 'react'
const STAFF = [
  { id: 1, name: 'Ritu', role: 'Senior Stylist', branch: 'Sector 17', phone: '98100-11111', salary: 25000, commission: 10, status: 'on_duty', rating: 4.9, clients: 312, revenue: 320000 },
  { id: 2, name: 'Neha', role: 'Hair Specialist', branch: 'Sector 35', phone: '98100-22222', salary: 22000, commission: 10, status: 'on_duty', rating: 4.7, clients: 248, revenue: 220000 },
  { id: 3, name: 'Sima', role: 'Beauty Expert', branch: 'Mohali', phone: '98100-33333', salary: 20000, commission: 8, status: 'break', rating: 4.8, clients: 196, revenue: 180000 },
  { id: 4, name: 'Pooja', role: 'Nail Technician', branch: 'Panchkula', phone: '98100-44444', salary: 18000, commission: 8, status: 'off', rating: 4.6, clients: 142, revenue: 120000 },
  { id: 5, name: 'Ananya', role: 'Makeup Artist', branch: 'Sector 17', phone: '98100-55555', salary: 23000, commission: 12, status: 'on_duty', rating: 4.9, clients: 88, revenue: 180000 },
]
const STATUS_BADGE = { on_duty: <span className="badge badge-success">On Duty</span>, break: <span className="badge badge-warning">Lunch Break</span>, off: <span className="badge badge-danger">Day Off</span> }
const BLANK = { name: '', role: '', branch: 'Sector 17', phone: '', salary: '', commission: '' }

export default function Staff() {
  const [staff, setStaff] = useState(STAFF)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)

  const save = () => {
    if (!form.name) return
    setStaff(p => [...p, { ...form, id: Date.now(), status: 'off', rating: 0, clients: 0, revenue: 0, salary: Number(form.salary), commission: Number(form.commission) }])
    setModal(false); setForm(BLANK)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Staff Management</div><div className="page-sub">{staff.length} staff members</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Staff</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {staff.map(s => (
          <div className="card" key={s.id}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="flex-gap">
                <div className="avatar avatar-lg">{s.name[0]}</div>
                <div><div className="fw-600">{s.name}</div><div className="text-muted" style={{ fontSize: 12 }}>{s.role}</div></div>
              </div>
              {STATUS_BADGE[s.status]}
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>📍 {s.branch} · 📞 {s.phone}</div>
            <div className="divider" />
            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{s.clients}</div><div className="stat-label">Clients/mo</div></div>
              <div className="stat-box"><div className="stat-val">₹{Math.round(s.revenue / 1000)}K</div><div className="stat-label">Revenue</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: '#f59e0b' }}>{s.rating}★</div><div className="stat-label">Rating</div></div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12 }} className="flex-between">
              <span className="text-muted">Salary: <span className="fw-600 mono">₹{s.salary.toLocaleString('en-IN')}</span></span>
              <span className="text-muted">Commission: <span className="fw-600">{s.commission}%</span></span>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Naya Staff Member</div><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Naam *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Role</label><input className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Branch</label><select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}><option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option></select></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Monthly Salary (₹)</label><input type="number" className="input" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Commission (%)</label><input type="number" className="input" value={form.commission} onChange={e => setForm(p => ({ ...p, commission: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>Save Staff</button>
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
