import React, { useState } from 'react'
const INIT = [
  { id: 1, name: 'Sector 17, Chandigarh', address: 'SCO 142, Sector 17-C, Chandigarh', phone: '0172-456-7890', staff: 5, clients: 312, revenue: 280000, status: 'active' },
  { id: 2, name: 'Sector 35, Chandigarh', address: 'SCO 88, Sector 35-B, Chandigarh', phone: '0172-567-8901', staff: 4, clients: 241, revenue: 210000, status: 'active' },
  { id: 3, name: 'Phase 7, Mohali', address: 'Phase 7 Market, SAS Nagar, Mohali', phone: '0172-678-9012', staff: 4, clients: 278, revenue: 240000, status: 'active' },
  { id: 4, name: 'Panchkula, Sec 9', address: 'SCO 22, Sector 9, Panchkula', phone: '0172-789-0123', staff: 3, clients: 198, revenue: 190000, status: 'growing' },
]
const STATUS_BADGE = { active: <span className="badge badge-success">Active</span>, growing: <span className="badge badge-warning">Growing</span>, inactive: <span className="badge badge-danger">Inactive</span> }
const BLANK = { name: '', address: '', phone: '', status: 'active' }

export default function Branches() {
  const [branches, setBranches] = useState(INIT)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const save = () => {
    if (!form.name) return
    if (editItem) {
      setBranches(p => p.map(b => b.id === editItem.id ? { ...b, ...form } : b))
    } else {
      setBranches(p => [...p, { ...form, id: Date.now(), staff: 0, clients: 0, revenue: 0 }])
    }
    setModal(false); setForm(BLANK); setEditItem(null)
  }

  const openEdit = (b) => {
    setEditItem(b)
    setForm({ name: b.name, address: b.address, phone: b.phone, status: b.status })
    setModal(true)
  }

  const deleteBranch = (id) => {
    setBranches(p => p.filter(b => b.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Branch Settings</div><div className="page-sub">{branches.length} branches</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Branch</button>
      </div>

      <div className="grid-2">
        {branches.map(b => (
          <div className="card" key={b.id}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="fw-600" style={{ fontSize: 15 }}>{b.name}</div>
              {STATUS_BADGE[b.status]}
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>📍 {b.address}</div>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>📞 {b.phone}</div>
            <div className="divider" />
            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{b.staff}</div><div className="stat-label">Staff</div></div>
              <div className="stat-box"><div className="stat-val">{b.clients}</div><div className="stat-label">Clients/mo</div></div>
              <div className="stat-box"><div className="stat-val">₹{Math.round(b.revenue / 1000)}K</div><div className="stat-label">Revenue</div></div>
            </div>
            <div className="divider" />
            <div className="flex-gap" style={{ marginTop: 4 }}>
              <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => openEdit(b)}>✏️ Edit</button>
              <button className="btn btn-sm" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(b)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Branch Edit Karo' : 'Naya Branch Add Karo'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null); setForm(BLANK) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Branch Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="jaise: Sector 22, Chandigarh" /></div>
              <div className="form-group full"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="SCO number, area..." /></div>
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
              <button className="btn btn-primary" onClick={save}>{editItem ? 'Update Karo' : 'Save Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null); setForm(BLANK) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Branch Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong> branch delete ho jayegi. Kya aap sure hain?
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => deleteBranch(deleteConfirm.id)}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
