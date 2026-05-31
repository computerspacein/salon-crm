import React, { useState } from 'react'
const INIT = [
  { id: 1, name: 'Hair Color (Global)', category: 'Hair', duration: 120, priceMin: 800, priceMax: 1800, active: true },
  { id: 2, name: 'Hair Cut & Style', category: 'Hair', duration: 45, priceMin: 200, priceMax: 500, active: true },
  { id: 3, name: 'Keratin Treatment', category: 'Hair', duration: 180, priceMin: 2000, priceMax: 4000, active: true },
  { id: 4, name: 'Bridal Makeup (Full)', category: 'Bridal', duration: 180, priceMin: 8000, priceMax: 15000, active: true },
  { id: 5, name: 'Facial (Basic)', category: 'Skin', duration: 45, priceMin: 350, priceMax: 600, active: true },
  { id: 6, name: 'Waxing (Full Body)', category: 'Skin', duration: 60, priceMin: 700, priceMax: 1200, active: true },
  { id: 7, name: 'Manicure + Pedicure', category: 'Nails', duration: 90, priceMin: 500, priceMax: 900, active: true },
  { id: 8, name: 'Threading (Eyebrows)', category: 'Threading', duration: 10, priceMin: 50, priceMax: 100, active: true },
]
const BLANK = { name: '', category: 'Hair', duration: 60, priceMin: '', priceMax: '' }
const CATS = ['Hair', 'Bridal', 'Skin', 'Nails', 'Threading', 'Makeup', 'Massage']
const CAT_COLOR = { Hair: 'badge-info', Bridal: 'badge-pink', Skin: 'badge-success', Nails: 'badge-warning', Threading: 'badge-danger', Makeup: 'badge-pink', Massage: 'badge-info' }

export default function Services() {
  const [services, setServices] = useState(INIT)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [catFilter, setCatFilter] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = catFilter === 'all' ? services : services.filter(s => s.category === catFilter)

  const save = () => {
    if (!form.name || !form.priceMin) return
    if (editItem) {
      setServices(p => p.map(s => s.id === editItem.id ? { ...s, ...form, priceMin: Number(form.priceMin), priceMax: Number(form.priceMax), duration: Number(form.duration) } : s))
    } else {
      setServices(p => [...p, { ...form, id: Date.now(), active: true, priceMin: Number(form.priceMin), priceMax: Number(form.priceMax), duration: Number(form.duration) }])
    }
    setModal(false); setForm(BLANK); setEditItem(null)
  }

  const openEdit = (s) => {
    setEditItem(s)
    setForm({ name: s.name, category: s.category, duration: s.duration, priceMin: s.priceMin, priceMax: s.priceMax })
    setModal(true)
  }

  const deleteService = (id) => {
    setServices(p => p.filter(s => s.id !== id))
    setDeleteConfirm(null)
  }

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
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Service Name</th><th>Category</th><th>Duration</th><th>Min Price</th><th>Max Price</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="fw-600">{s.name}</td>
                  <td><span className={`badge ${CAT_COLOR[s.category] || 'badge-info'}`}>{s.category}</span></td>
                  <td className="text-muted">{s.duration} min</td>
                  <td className="mono">₹{s.priceMin.toLocaleString('en-IN')}</td>
                  <td className="mono">₹{s.priceMax.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
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
              <div className="form-group"><label className="label">Duration (minutes)</label><input type="number" className="input" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Min Price (₹) *</label><input type="number" className="input" value={form.priceMin} onChange={e => setForm(p => ({ ...p, priceMin: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Max Price (₹)</label><input type="number" className="input" value={form.priceMax} onChange={e => setForm(p => ({ ...p, priceMax: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>{editItem ? 'Update Karo' : 'Save Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Service Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong> delete ho jayegi. Sure hain?
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => deleteService(deleteConfirm.id)}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
