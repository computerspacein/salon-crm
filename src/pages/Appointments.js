import React, { useState, useEffect } from 'react'
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, getCustomers, getStaff, getServices, getBranches } from '../lib/supabase'

const STATUS_BADGE = {
  completed: <span className="badge badge-success">Done</span>,
  in_progress: <span className="badge badge-warning">In Progress</span>,
  upcoming: <span className="badge badge-info">Upcoming</span>,
  cancelled: <span className="badge badge-danger">Cancelled</span>,
}

const BLANK = {
  customer_id: '', branch_id: '', staff_id: '', service_id: '',
  appointment_date: new Date().toISOString().slice(0, 10),
  appointment_time: '10:00',
  amount: '', discount: 0, payment_mode: 'Cash', status: 'upcoming', notes: ''
}

export default function Appointments() {
  const [appts, setAppts] = useState([])
  const [customers, setCustomers] = useState([])
  const [staff, setStaff] = useState([])
  const [services, setServices] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'all', search: '' })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [a, c, s, sv, b] = await Promise.all([
      getAppointments(), getCustomers(), getStaff(), getServices(), getBranches()
    ])
    setAppts(a.data || [])
    setCustomers(c.data || [])
    setStaff(s.data || [])
    setServices(sv.data || [])
    setBranches(b.data || [])
    setLoading(false)
  }

  const filtered = appts.filter(a => {
    if (filter.status !== 'all' && a.status !== filter.status) return false
    if (filter.search && !a.customers?.name?.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const save = async () => {
    if (!form.customer_id || !form.amount) return
    setSaving(true)
    const amount = Number(form.amount)
    const discount = Number(form.discount) || 0
    const payload = {
      customer_id: form.customer_id || null,
      branch_id: form.branch_id || null,
      staff_id: form.staff_id || null,
      service_id: form.service_id || null,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      amount: amount,
      discount: discount,
      final_amount: amount - discount,
      payment_mode: form.payment_mode,
      status: form.status,
      notes: form.notes
    }
    if (editItem) { await updateAppointment(editItem.id, payload) }
    else { await addAppointment(payload) }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (a) => {
    setEditItem(a)
    setForm({
      customer_id: a.customer_id || '', branch_id: a.branch_id || '',
      staff_id: a.staff_id || '', service_id: a.service_id || '',
      appointment_date: a.appointment_date, appointment_time: a.appointment_time,
      amount: a.amount, discount: a.discount || 0,
      payment_mode: a.payment_mode, status: a.status, notes: a.notes || ''
    })
    setModal(true)
  }

  const confirmDelete = async () => {
    await deleteAppointment(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  const updateStatus = async (id, status) => {
    await updateAppointment(id, { status })
    setAppts(p => p.map(a => a.id === id ? { ...a, status } : a))
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading appointments...</div></div></div>

  const noCustomers = customers.length === 0

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Appointments</div><div className="page-sub">{filtered.length} appointments</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Naya Appointment</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Customer search..." value={filter.search} onChange={e => setFilter(p => ({ ...p, search: e.target.value }))} style={{ width: 200 }} />
        <select className="select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
          <option value="all">Sab Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {appts.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📅</div><div>Koi appointment nahi — pehla appointment book karo!</div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Service</th><th>Staff</th><th>Branch</th><th>Date & Time</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex-gap">
                        <div className="avatar">{a.customers?.name?.split(' ').map(w => w[0]).join('') || '?'}</div>
                        <div><div className="fw-600">{a.customers?.name || 'Unknown'}</div><div className="text-muted">{a.customers?.phone || ''}</div></div>
                      </div>
                    </td>
                    <td>{a.services?.name || '—'}</td>
                    <td>{a.staff?.name || '—'}</td>
                    <td>{a.branches?.name || '—'}</td>
                    <td className="text-muted">{a.appointment_date}<br />{a.appointment_time}</td>
                    <td className="mono fw-600">₹{Number(a.final_amount || a.amount).toLocaleString('en-IN')}</td>
                    <td>{a.payment_mode}</td>
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
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Appointment Edit Karo' : 'Naya Appointment'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>

            {noCustomers && (
              <div style={{ background: 'var(--warning-bg)', color: '#92400e', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                ⚠️ Pehle <strong>Customers</strong> page pe ek customer add karo, tabhi appointment book kar paoge.
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full">
                <label className="label">Customer *</label>
                <select className="select" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Service</label>
                <select className="select" value={form.service_id} onChange={e => {
                  const sv = services.find(s => s.id === e.target.value)
                  setForm(p => ({ ...p, service_id: e.target.value, amount: sv ? sv.price_min : p.amount }))
                }}>
                  <option value="">-- Service chuno --</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.price_min}-{s.price_max})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Staff</label>
                <select className="select" value={form.staff_id} onChange={e => setForm(p => ({ ...p, staff_id: e.target.value }))}>
                  <option value="">-- Staff chuno --</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Branch</label>
                <select className="select" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                  <option value="">-- Branch chuno --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Payment Mode</label>
                <select className="select" value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Online</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date *</label><input type="date" className="input" value={form.appointment_date} onChange={e => setForm(p => ({ ...p, appointment_date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Time</label><input type="time" className="input" value={form.appointment_time} onChange={e => setForm(p => ({ ...p, appointment_time: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Discount (₹)</label><input type="number" className="input" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="upcoming">Upcoming</option><option value="in_progress">In Progress</option><option value="completed">Done</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group full"><label className="label">Notes</label><textarea className="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving || noCustomers}>{saving ? 'Saving...' : editItem ? 'Update Karo' : 'Book Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><div className="modal-title">Appointment Delete Karna Chahte Ho?</div><button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong>{deleteConfirm.customers?.name || 'Yeh'}</strong> ka appointment delete ho jayega.
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={confirmDelete}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
