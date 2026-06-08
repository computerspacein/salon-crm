import React, { useState, useEffect } from 'react'
import { getUsers, addUser, updateUserAccount, deleteUserAccount } from '../lib/supabase'

const ROLE_BADGE = {
  admin: <span className="badge badge-pink">Admin</span>,
  staff: <span className="badge badge-info">Staff</span>,
}
const BLANK = { username: '', password: '', name: '', role: 'staff' }

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await getUsers()
    setUsers(data || [])
    setLoading(false)
  }

  const save = async () => {
    setErr('')
    if (!form.name || !form.username) return setErr('Naam aur username zaroori hai')
    if (!editItem && !form.password) return setErr('Password zaroori hai')
    setSaving(true)
    if (editItem) {
      const updates = { name: form.name, role: form.role }
      if (form.password) updates.password = form.password
      await updateUserAccount(editItem.id, updates)
    } else {
      const { error } = await addUser(form)
      if (error) { setErr('Username already exists ya koi error'); setSaving(false); return }
    }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (u) => {
    setEditItem(u)
    setForm({ username: u.username, password: '', name: u.name, role: u.role })
    setModal(true); setErr('')
  }

  const confirmDelete = async () => {
    await deleteUserAccount(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading users...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">User Management</div><div className="page-sub">{users.length} login accounts</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setErr(''); setModal(true) }}>+ Naya User</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><div className="flex-gap"><div className="avatar">{u.name?.[0]}</div><span className="fw-600">{u.name}</span></div></td>
                  <td className="mono">{u.username}</td>
                  <td>{ROLE_BADGE[u.role]}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>✏️</button>
                      {u.username !== currentUser.username && (
                        <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(u)}>🗑️</button>
                      )}
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
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'User Edit Karo' : 'Naya User Banao'}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Naam *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Username *</label><input className="input" value={form.username} disabled={!!editItem} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="login ke liye" /></div>
              <div className="form-group full"><label className="label">Password {editItem ? '(khaali chhodo agar nahi badalna)' : '*'}</label><input type="text" className="input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={editItem ? 'Naya password' : 'Password set karo'} /></div>
              <div className="form-group full"><label className="label">Role</label>
                <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="staff">Staff (limited — billing only)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>
            </div>
            {err && <div style={{ background: 'var(--danger-bg)', color: '#991b1b', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{err}</div>}
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update Karo' : 'User Banao'}</button>
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><div className="modal-title">User Delete Karna Chahte Ho?</div><button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}><strong>{deleteConfirm.name}</strong> ({deleteConfirm.username}) ka login delete ho jayega.</div>
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
