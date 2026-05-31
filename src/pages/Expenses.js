import React, { useState } from 'react'
const INIT = [
  { id: 1, date: '2026-05-30', desc: "L'Oreal Product Purchase", category: 'Inventory', branch: 'All Branches', amount: 28500, mode: 'Bank Transfer' },
  { id: 2, date: '2026-05-30', desc: 'Staff Salaries — May 2026', category: 'Payroll', branch: 'All Branches', amount: 185000, mode: 'Bank Transfer' },
  { id: 3, date: '2026-05-29', desc: 'Rent — Sector 17', category: 'Rent', branch: 'Sector 17', amount: 45000, mode: 'Cheque' },
  { id: 4, date: '2026-05-29', desc: 'Rent — Sector 35', category: 'Rent', branch: 'Sector 35', amount: 38000, mode: 'Cheque' },
  { id: 5, date: '2026-05-29', desc: 'Electricity Bill — Sector 35', category: 'Utilities', branch: 'Sector 35', amount: 8200, mode: 'UPI' },
  { id: 6, date: '2026-05-28', desc: 'Instagram Ads', category: 'Marketing', branch: 'All Branches', amount: 5000, mode: 'Card' },
]
const BLANK = { date: '', desc: '', category: 'Rent', branch: 'Sector 17', amount: '', mode: 'Cash' }
const CATS = ['Rent', 'Payroll', 'Inventory', 'Utilities', 'Marketing', 'Maintenance', 'Other']

export default function Expenses() {
  const [expenses, setExpenses] = useState(INIT)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [cat, setCat] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = cat === 'all' ? expenses : expenses.filter(e => e.category === cat)
  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const byCategory = CATS.map(c => ({ cat: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(x => x.total > 0)

  const save = () => {
    if (!form.desc || !form.amount) return
    if (editItem) {
      setExpenses(p => p.map(e => e.id === editItem.id ? { ...e, ...form, amount: Number(form.amount) } : e))
    } else {
      setExpenses(p => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...p])
    }
    setModal(false); setForm(BLANK); setEditItem(null)
  }

  const openEdit = (e) => {
    setEditItem(e)
    setForm({ date: e.date, desc: e.desc, category: e.category, branch: e.branch, amount: e.amount, mode: e.mode })
    setModal(true)
  }

  const deleteExpense = (id) => {
    setExpenses(p => p.filter(e => e.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Expenses</div><div className="page-sub">Total: ₹{total.toLocaleString('en-IN')}</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Add Expense</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {byCategory.map(b => (
          <div className="metric" key={b.cat}>
            <div className="metric-label">{b.cat}</div>
            <div className="metric-value" style={{ fontSize: 18 }}>₹{b.total.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
      <div className="filter-bar">
        <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">Sab Categories</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="text-muted mono">{e.date}</td>
                  <td className="fw-600">{e.desc}</td>
                  <td><span className="badge badge-danger">{e.category}</span></td>
                  <td>{e.branch}</td>
                  <td>{e.mode}</td>
                  <td className="debit">₹{e.amount.toLocaleString('en-IN')}</td>
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

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editItem ? 'Expense Edit Karo' : 'Naya Expense'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="label">Branch</label><select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}><option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option><option>All Branches</option></select></div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Payment Mode</label><select className="select" value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option></select></div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
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
              <div className="modal-title">Expense Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.desc}</strong> delete ho jayega. Sure hain?
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => deleteExpense(deleteConfirm.id)}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
