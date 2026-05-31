import React, { useState } from 'react'

const INIT = [
  { id: 1042, customer: 'Priya Sharma', phone: '98765-43210', service: 'Hair Color + Cut', staff: 'Ritu', branch: 'Sector 17', date: '2026-05-31', time: '9:30 AM', amount: 1800, payment: 'UPI', status: 'completed', notes: '' },
  { id: 1043, customer: 'Meena Gupta', phone: '87654-32109', service: 'Facial + Waxing', staff: 'Sima', branch: 'Sector 35', date: '2026-05-31', time: '10:00 AM', amount: 950, payment: 'Cash', status: 'completed', notes: '' },
  { id: 1044, customer: 'Sunita Rani', phone: '76543-21098', service: 'Bridal Trial', staff: 'Ritu', branch: 'Mohali', date: '2026-05-31', time: '11:15 AM', amount: 3500, payment: 'Card', status: 'in_progress', notes: 'Bridal on June 5' },
  { id: 1045, customer: 'Anita Verma', phone: '65432-10987', service: 'Keratin Treatment', staff: 'Neha', branch: 'Sector 17', date: '2026-05-31', time: '12:00 PM', amount: 2200, payment: 'UPI', status: 'upcoming', notes: '' },
  { id: 1046, customer: 'Kavita Singh', phone: '54321-09876', service: 'Mani + Pedi', staff: 'Sima', branch: 'Panchkula', date: '2026-05-31', time: '1:30 PM', amount: 650, payment: 'Cash', status: 'upcoming', notes: '' },
]

const STATUS_BADGE = {
  completed: <span className="badge badge-success">Done</span>,
  in_progress: <span className="badge badge-warning">In Progress</span>,
  upcoming: <span className="badge badge-info">Upcoming</span>,
  cancelled: <span className="badge badge-danger">Cancelled</span>,
}

const BLANK = { customer: '', phone: '', service: '', staff: '', branch: 'Sector 17', date: '', time: '', amount: '', payment: 'Cash', status: 'upcoming', notes: '' }

export default function Appointments({ branches }) {
  const [appts, setAppts] = useState(INIT)
  const [filter, setFilter] = useState({ branch: 'all', status: 'all', search: '' })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = appts.filter(a => {
    if (filter.branch !== 'all' && !a.branch.toLowerCase().includes(filter.branch)) return false
    if (filter.status !== 'all' && a.status !== filter.status) return false
    if (filter.search && !a.customer.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const save = () => {
    if (!form.customer || !form.service || !form.amount) return
    if (editItem) {
      setAppts(p => p.map(a => a.id === editItem.id ? { ...a, ...form, amount: Number(form.amount) } : a))
    } else {
      setAppts(p => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...p])
    }
    setModal(false); setForm(BLANK); setEditItem(null)
  }

  const openEdit = (a) => {
    setEditItem(a)
    setForm({ customer: a.customer, phone: a.phone, service: a.service, staff: a.staff, branch: a.branch, date: a.date, time: a.time, amount: a.amount, payment: a.payment, status: a.status, notes: a.notes })
    setModal(true)
  }

  const deleteAppt = (id) => {
    setAppts(p => p.filter(a => a.id !== id))
    setDeleteConfirm(null)
  }

  const updateStatus = (id, status) => setAppts(p => p.map(a => a.id === id ? { ...a, status } : a))

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Appointments</div><div className="page-sub">{filtered.length} appointments</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Naya Appointment</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Customer search..." value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} style={{ width: 200 }} />
        <select className="select" value={filter.branch} onChange={e => setFilter(p => ({ ...p, branch: e.target.value }))}>
          <option value="all">Sab Branches</option>
          <option value="sector 17">Sector 17</option>
          <option value="sector 35">Sector 35</option>
          <option value="mohali">Mohali</option>
          <option value="panchkula">Panchkula</option>
        </select>
        <select className="select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
          <option value="all">Sab Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Customer</th><th>Service</th><th>Staff</th><th>Branch</th><th>Date & Time</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td className="text-muted mono">{a.id}</td>
                  <td>
                    <div className="flex-gap">
                      <div className="avatar">{a.customer.split(' ').map(w => w[0]).join('')}</div>
                      <div><div className="fw-600">{a.customer}</div><div className="text-muted">{a.phone}</div></div>
                    </div>
                  </td>
                  <td>{a.service}</td>
                  <td>{a.staff}</td>
                  <td>{a.branch}</td>
                  <td className="text-muted">{a.date}<br />{a.time}</td>
                  <td className="mono fw-600">₹{a.amount.toLocaleString('en-IN')}</td>
                  <td>{a.payment}</td>
                  <td>
                    <select className="select" style={{ fontSize: 11, padding: '3px 6px' }} value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                      <option value="upcoming">Upcoming</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Done</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-sm" onClick={() => openEdit(a)}>✏️</button>
                      <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(a)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Appointment Edit Karo' : 'Naya Appointment'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Customer Name *</label><input className="input" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Service *</label><input className="input" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Staff</label>
                <select className="select" value={form.staff} onChange={e => setForm(p => ({ ...p, staff: e.target.value }))}>
                  <option>Ritu</option><option>Neha</option><option>Sima</option><option>Pooja</option><option>Ananya</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}>
                  <option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.payment} onChange={e => setForm(p => ({ ...p, payment: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Online</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date *</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Time</label><input type="time" className="input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="upcoming">Upcoming</option><option value="in_progress">In Progress</option><option value="completed">Done</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group full"><label className="label">Notes</label><textarea className="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>{editItem ? 'Update Karo' : 'Save Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Appointment Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.customer}</strong> ka appointment delete ho jayega. Sure hain?
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => deleteAppt(deleteConfirm.id)}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
