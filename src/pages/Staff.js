import React, { useState, useEffect } from 'react'
import { getStaff, addStaff, updateStaff, deleteStaff, getBranches } from '../lib/supabase'

const STATUS_BADGE = { on_duty: <span className="badge badge-success">On Duty</span>, break: <span className="badge badge-warning">Break</span>, off: <span className="badge badge-danger">Day Off</span> }
const BLANK = { name: '', role: '', branch_id: '', phone: '', salary: '', commission_pct: '', status: 'off' }

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [s, b] = await Promise.all([getStaff(), getBranches()])
    setStaff(s.data || [])
    setBranches(b.data || [])
    setLoading(false)
  }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const payload = { ...form, salary: Number(form.salary) || 0, commission_pct: Number(form.commission_pct) || 0 }
    if (editItem) { await updateStaff(editItem.id, payload) }
    else { await addStaff(payload) }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (s) => {
    setEditItem(s)
    setForm({ name: s.name, role: s.role || '', branch_id: s.branch_id || '', phone: s.phone || '', salary: s.salary || '', commission_pct: s.commission_pct || '', status: s.status || 'off' })
    setModal(true)
  }

  const confirmDelete = async () => {
    await deleteStaff(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading staff...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Staff Management</div><div className="page-sub">{staff.length} staff members</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ ...BLANK, branch_id: branches[0]?.id || '' }); setModal(true) }}>+ Add Staff</button>
      </div>

      {staff.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">👤</div><div>Koi staff nahi — pehla staff member add karo!</div></div></div>
      ) : (
        <div className="grid-3">
          {staff.map(s => (
            <div className="card" key={s.id}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <div className="flex-gap">
                  <div className="avatar avatar-lg">{s.name?.[0]}</div>
                  <div><div className="fw-600">{s.name}</div><div className="text-muted" style={{ fontSize: 12 }}>{s.role}</div></div>
                </div>
                {STATUS_BADGE[s.status] || STATUS_BADGE.off}
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
                📍 {s.branches?.name || '—'} · 📞 {s.phone || '—'}
              </div>
              <div className="divider" />
              <div style={{ marginTop: 8, fontSize: 12 }} className="flex-between">
                <span className="text-muted">Salary: <span className="fw-600 mono">₹{(s.salary || 0).toLocaleString('en-IN')}</span></span>
                <span className="text-muted">Commission: <span className="fw-600">{s.commission_pct || 0}%</span></span>
              </div>
              <div className="divider" />
              <div className="flex-gap" style={{ marginTop: 4 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => openEdit(s)}>✏️ Edit</button>
                <button className="btn btn-sm" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(s)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
          <div className="card" style={{ border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, cursor: 'pointer' }}
            onClick={() => { setEditItem(null); setForm({ ...BLANK, branch_id: branches[0]?.id || '' }); setModal(true) }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Naya Staff Add Karo</div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Staff Edit Karo' : 'Naya Staff Member'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Naam *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Role</label><input className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                  <option value="">-- Select Branch --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Monthly Salary (₹)</label><input type="number" className="input" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Commission (%)</label><input type="number" className="input" value={form.commission_pct} onChange={e => setForm(p => ({ ...p, commission_pct: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="on_duty">On Duty</option>
                  <option value="break">Break</option>
                  <option value="off">Day Off</option>
                </select>
              </div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update Karo' : 'Save Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Staff Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong>{deleteConfirm.name}</strong> permanently delete ho jayega.
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
