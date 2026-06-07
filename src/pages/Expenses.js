import React, { useState, useEffect } from 'react'
import { getExpenses, addExpense, updateExpense, deleteExpense, getBranches } from '../lib/supabase'

const BLANK = { description: '', category: 'Rent', branch_id: '', amount: '', payment_mode: 'Cash', expense_date: new Date().toISOString().slice(0, 10) }
const CATS = ['Rent', 'Payroll', 'Inventory', 'Utilities', 'Marketing', 'Maintenance', 'Other']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [cat, setCat] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [e, b] = await Promise.all([getExpenses(), getBranches()])
    setExpenses(e.data || [])
    setBranches(b.data || [])
    setLoading(false)
  }

  const filtered = cat === 'all' ? expenses : expenses.filter(e => e.category === cat)
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
  const byCategory = CATS.map(c => ({ cat: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0) })).filter(x => x.total > 0)

  const save = async () => {
    if (!form.description || !form.amount) return
    setSaving(true)
    const payload = { ...form, amount: Number(form.amount) }
    if (editItem) { await updateExpense(editItem.id, payload) }
    else { await addExpense(payload) }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (e) => {
    setEditItem(e)
    setForm({ description: e.description, category: e.category, branch_id: e.branch_id || '', amount: e.amount, payment_mode: e.payment_mode, expense_date: e.expense_date })
    setModal(true)
  }

  const confirmDelete = async () => {
    await deleteExpense(deleteConfirm.id)
    await load()
    setDeleteConfirm(null)
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading expenses...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Expenses</div><div className="page-sub">Total: ₹{total.toLocaleString('en-IN')}</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Expense</button>
      </div>

      {byCategory.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 20 }}>
          {byCategory.map(b => (
            <div className="metric" key={b.cat}>
              <div className="metric-label">{b.cat}</div>
              <div className="metric-value" style={{ fontSize: 18 }}>₹{b.total.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}

      <div className="filter-bar">
        <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">Sab Categories</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {expenses.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📉</div><div>Koi expense nahi abhi tak</div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td className="text-muted mono">{e.expense_date}</td>
                    <td className="fw-600">{e.description}</td>
                    <td><span className="badge badge-danger">{e.category}</span></td>
                    <td>{e.branches?.name || '—'}</td>
                    <td>{e.payment_mode}</td>
                    <td className="debit">₹{Number(e.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-sm" onClick={() => openEdit(e)}>✏️</button>
                        <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(e)}>🗑️</button>
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
              <div className="modal-title">{editItem ? 'Expense Edit Karo' : 'Naya Expense'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} /></div>
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
            <div className="modal-header"><div className="modal-title">Expense Delete Karna Chahte Ho?</div><button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}><strong>{deleteConfirm.description}</strong> permanently delete ho jayega.</div>
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
