import React, { useState, useEffect } from 'react'
import { getBranches, addBranch, updateBranch, deleteBranch } from '../lib/supabase'

const STATUS_BADGE = {
  active: <span className="badge badge-success">Active</span>,
  growing: <span className="badge badge-warning">Growing</span>,
  inactive: <span className="badge badge-danger">Inactive</span>
}
const BLANK = { name: '', address: '', phone: '', city: 'Chandigarh', status: 'active' }

export default function Branches() {
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
    const { data } = await getBranches()
    setBranches(data || [])
    setLoading(false)
  }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    if (editItem) {
      await updateBranch(editItem.id, form)
    } else {
      await addBranch(form)
    }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (b) => {
    setEditItem(b)
    setForm({ name: b.name, address: b.address || '', phone: b.phone || '', city: b.city || 'Chandigarh', status: b.status || 'active' })
    setModal(true)
  }

  const confirmDelete = async () => {
    await deleteBranch(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading branches...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Branch Settings</div><div className="page-sub">{branches.length} branches</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Branch</button>
      </div>

      {branches.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🏪</div><div>Koi branch nahi — pehli branch add karo!</div></div></div>
      ) : (
        <div className="grid-2">
          {branches.map(b => (
            <div className="card" key={b.id}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <div className="fw-600" style={{ fontSize: 15 }}>{b.name}</div>
                {STATUS_BADGE[b.status] || STATUS_BADGE.active}
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>📍 {b.address || '—'}</div>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>🏙️ {b.city || '—'}</div>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>📞 {b.phone || '—'}</div>
              <div className="divider" />
              <div className="flex-gap" style={{ marginTop: 8 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => openEdit(b)}>✏️ Edit</button>
                <button className="btn btn-sm" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(b)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Branch Edit Karo' : 'Naya Branch Add Karo'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Branch Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="jaise: Sector 22, Chandigarh" /></div>
              <div className="form-group full"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="SCO number, area..." /></div>
              <div className="form-group"><label className="label">City</label><input className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="growing">Growing</option>
                  <option value="inactive">Inactive</option>
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
              <div className="modal-title">Branch Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong> permanently delete ho jayegi.
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
