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

  const filtered = cat === 'all' ? expenses : expenses.filter(e => e.category === cat)
  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const byCategory = CATS.map(c => ({ cat: c, total: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(x => x.total > 0)

  const save = () => {
    if (!form.desc || !form.amount) return
    setExpenses(p => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...p])
    setModal(false); setForm(BLANK)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Expenses</div><div className="page-sub">Total: ₹{total.toLocaleString('en-IN')}</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Expense</button>
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
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Amount</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="text-muted mono">{e.date}</td>
                  <td className="fw-600">{e.desc}</td>
                  <td><span className="badge badge-danger">{e.category}</span></td>
                  <td>{e.branch}</td>
                  <td>{e.mode}</td>
                  <td className="debit">₹{e.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Naya Expense</div><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label><select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="label">Branch</label><select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}><option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option><option>All Branches</option></select></div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Payment Mode</label><select className="select" value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option></select></div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="gap-btn"><button className="btn btn-primary" onClick={save}>Save Expense</button><button className="btn" onClick={() => setModal(false)}>Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
