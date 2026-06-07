import React, { useState, useEffect } from 'react'
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../lib/supabase'

const BLANK = { name: '', phone: '', email: '', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [selected, setSelected] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await getCustomers()
    setCustomers(data || [])
    setLoading(false)
  }

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const save = async () => {
    if (!form.name || !form.phone) return
    setSaving(true)
    if (editItem) {
      await updateCustomer(editItem.id, form)
    } else {
      await addCustomer(form)
    }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (c) => {
    setEditItem(c)
    setForm({ name: c.name, phone: c.phone, email: c.email || '', notes: c.notes || '' })
    setModal(true); setSelected(null)
  }

  const confirmDelete = async () => {
    await deleteCustomer(deleteConfirm.id)
    await load()
    setDeleteConfirm(null); setSelected(null)
  }

  const stars = n => '★'.repeat(n || 1) + '☆'.repeat(5 - (n || 1))

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading customers...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Customers</div><div className="page-sub">{filtered.length} customers</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Customer</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Naam ya phone se search karo..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
      </div>

      {customers.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">👥</div><div>Koi customer nahi — pehla customer add karo!</div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Visits</th><th>Total Spent</th><th>Loyalty Pts</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex-gap" style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                        <div className="avatar">{c.name?.split(' ').map(w => w[0]).join('')}</div>
                        <div><div className="fw-600">{c.name}</div><div className="text-muted">{c.email || '—'}</div></div>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td className="mono">{c.total_visits || 0}</td>
                    <td className="mono fw-600">₹{(c.total_spent || 0).toLocaleString('en-IN')}</td>
                    <td className="mono" style={{ color: 'var(--pink)', fontWeight: 600 }}>{c.loyalty_points || 0}</td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-sm" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(c)}>🗑️</button>
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
              <div className="modal-title">{editItem ? 'Customer Edit Karo' : 'Naya Customer'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Naam *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Notes</label><textarea className="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update Karo' : 'Save Karo'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="flex-gap">
                <div className="avatar avatar-lg">{selected.name?.split(' ').map(w => w[0]).join('')}</div>
                <div><div className="modal-title">{selected.name}</div><div className="text-muted">{selected.phone}</div></div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{selected.total_visits || 0}</div><div className="stat-label">Total Visits</div></div>
              <div className="stat-box"><div className="stat-val">₹{Math.round((selected.total_spent || 0) / 1000)}K</div><div className="stat-label">Total Spent</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: 'var(--pink)' }}>{selected.loyalty_points || 0}</div><div className="stat-label">Loyalty Pts</div></div>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 13 }}>
              <div className="flex-gap" style={{ marginBottom: 8 }}><span className="text-muted" style={{ width: 80 }}>Email:</span><span>{selected.email || '—'}</span></div>
              {selected.notes && <div className="flex-gap"><span className="text-muted" style={{ width: 80 }}>Notes:</span><span>{selected.notes}</span></div>}
            </div>
            <div className="gap-btn" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => openEdit(selected)}>✏️ Edit</button>
              <button className="btn" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => { setDeleteConfirm(selected); setSelected(null) }}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Customer Delete Karna Chahte Ho?</div>
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
