import React, { useState, useEffect } from 'react'
import { getServices, addService, updateService, deleteService } from '../lib/supabase'

const BLANK = { name: '', category: 'Hair', duration_min: 60, price_min: '', price_max: '', is_active: true }
const CATS = ['Hair', 'Bridal', 'Skin', 'Nails', 'Threading', 'Makeup', 'Massage']
const CAT_COLOR = { Hair: 'badge-info', Bridal: 'badge-pink', Skin: 'badge-success', Nails: 'badge-warning', Threading: 'badge-danger', Makeup: 'badge-pink', Massage: 'badge-info' }

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [catFilter, setCatFilter] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await getServices()
    setServices(data || [])
    setLoading(false)
  }

  const filtered = catFilter === 'all' ? services : services.filter(s => s.category === catFilter)

  const save = async () => {
    if (!form.name || !form.price_min) return
    setSaving(true)
    const payload = { ...form, duration_min: Number(form.duration_min), price_min: Number(form.price_min), price_max: Number(form.price_max) }
    if (editItem) { await updateService(editItem.id, payload) }
    else { await addService(payload) }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (s) => {
    setEditItem(s)
    setForm({ name: s.name, category: s.category, duration_min: s.duration_min, price_min: s.price_min, price_max: s.price_max, is_active: s.is_active })
    setModal(true)
  }

  const confirmDelete = async () => {
    await deleteService(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading services...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Services & Pricing</div><div className="page-sub">{services.length} services</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Service</button>
      </div>
      <div className="filter-bar">
        <select className="select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">Sab Categories</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {services.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">✂️</div><div>Koi service nahi — pehli service add karo!<br/><small style={{color:'var(--text-muted)'}}>Ya Supabase SQL Editor mein schema run karo jisme seed data hoga</small></div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Service Name</th><th>Category</th><th>Duration</th><th>Min Price</th><th>Max Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="fw-600">{s.name}</td>
                    <td><span className={`badge ${CAT_COLOR[s.category] || 'badge-info'}`}>{s.category}</span></td>
                    <td className="text-muted">{s.duration_min} min</td>
                    <td className="mono">₹{Number(s.price_min).toLocaleString('en-IN')}</td>
                    <td className="mono">₹{Number(s.price_max).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-sm" onClick={() => openEdit(s)}>✏️</button>
                        <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(s)}>🗑️</button>
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
              <div className="modal-title">{editItem ? 'Service Edit Karo' : 'Naya Service'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Service Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="label">Duration (min)</label><input type="number" className="input" value={form.duration_min} onChange={e => setForm(p => ({ ...p, duration_min: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Min Price (₹) *</label><input type="number" className="input" value={form.price_min} onChange={e => setForm(p => ({ ...p, price_min: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Max Price (₹)</label><input type="number" className="input" value={form.price_max} onChange={e => setForm(p => ({ ...p, price_max: e.target.value }))} /></div>
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
            <div className="modal-header"><div className="modal-title">Service Delete Karna Chahte Ho?</div><button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}><strong>{deleteConfirm.name}</strong> permanently delete ho jayegi.</div>
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
