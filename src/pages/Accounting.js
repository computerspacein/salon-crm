import React, { useState } from 'react'

const INIT_LEDGER = [
  { id: 1, date: '2026-05-31', desc: 'Hair Color — Priya Sharma', category: 'Service Income', branch: 'Sector 17', mode: 'UPI', debit: 0, credit: 1800 },
  { id: 2, date: '2026-05-31', desc: 'Facial + Waxing — Meena Gupta', category: 'Service Income', branch: 'Sector 35', mode: 'Cash', debit: 0, credit: 950 },
  { id: 3, date: '2026-05-30', desc: "L'Oreal Product Purchase", category: 'Inventory', branch: 'All Branches', mode: 'Bank Transfer', debit: 28500, credit: 0 },
  { id: 4, date: '2026-05-30', desc: 'Staff Salaries — May 2026', category: 'Payroll', branch: 'All Branches', mode: 'Bank Transfer', debit: 185000, credit: 0 },
  { id: 5, date: '2026-05-30', desc: 'Bridal Trial — Sunita Rani', category: 'Service Income', branch: 'Mohali', mode: 'Card', debit: 0, credit: 3500 },
  { id: 6, date: '2026-05-29', desc: 'Rent — Sector 17, May 2026', category: 'Rent', branch: 'Sector 17', mode: 'Cheque', debit: 45000, credit: 0 },
  { id: 7, date: '2026-05-29', desc: 'Electricity Bill — Sector 35', category: 'Utilities', branch: 'Sector 35', mode: 'UPI', debit: 8200, credit: 0 },
  { id: 8, date: '2026-05-28', desc: 'Keratin Treatment — Anita Verma', category: 'Service Income', branch: 'Sector 17', mode: 'UPI', debit: 0, credit: 2200 },
]

const BLANK = { date: '', desc: '', category: 'Service Income', branch: 'Sector 17', mode: 'Cash', type: 'credit', amount: '' }

export default function Accounting() {
  const [ledger, setLedger] = useState(INIT_LEDGER)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [filter, setFilter] = useState('all')

  const totalCredit = ledger.reduce((s, r) => s + r.credit, 0)
  const totalDebit = ledger.reduce((s, r) => s + r.debit, 0)
  const netProfit = totalCredit - totalDebit

  const filtered = filter === 'all' ? ledger : ledger.filter(r => filter === 'credit' ? r.credit > 0 : r.debit > 0)

  const save = () => {
    if (!form.desc || !form.amount) return
    const entry = {
      id: Date.now(),
      date: form.date || new Date().toISOString().slice(0, 10),
      desc: form.desc,
      category: form.category,
      branch: form.branch,
      mode: form.mode,
      debit: form.type === 'debit' ? Number(form.amount) : 0,
      credit: form.type === 'credit' ? Number(form.amount) : 0,
    }
    setLedger(p => [entry, ...p])
    setModal(false)
    setForm(BLANK)
  }

  const fmt = n => n > 0 ? `₹${n.toLocaleString('en-IN')}` : '—'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Accounting & Ledger</div>
          <div className="page-sub">Is Mahine Ka Hisaab</div>
        </div>
        <div className="flex-gap">
          <button className="btn">📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Entry</button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-item">
          <div className="summary-item-label">Total Income</div>
          <div className="summary-item-value text-success">₹{totalCredit.toLocaleString('en-IN')}</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">Total Expenses</div>
          <div className="summary-item-value text-danger">₹{totalDebit.toLocaleString('en-IN')}</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">Net Profit</div>
          <div className="summary-item-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            ₹{Math.abs(netProfit).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Sab Transactions</option>
          <option value="credit">Sirf Income</option>
          <option value="debit">Sirf Expenses</option>
        </select>
        <select className="select"><option>Is Mahine</option><option>Pichla Mahina</option><option>Is Saal</option></select>
        <select className="select"><option>Sab Branches</option><option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option></select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Debit (₹)</th><th>Credit (₹)</th></tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="text-muted mono">{r.date}</td>
                  <td className="fw-600">{r.desc}</td>
                  <td><span className="badge badge-info">{r.category}</span></td>
                  <td>{r.branch}</td>
                  <td>{r.mode}</td>
                  <td className="debit">{fmt(r.debit)}</td>
                  <td className="credit">{fmt(r.credit)}</td>
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
              <div className="modal-title">Naya Accounting Entry</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Type</label>
                <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="credit">Income / Credit</option>
                  <option value="debit">Expense / Debit</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option>Service Income</option><option>Product Sales</option><option>Rent</option><option>Payroll</option><option>Inventory</option><option>Utilities</option><option>Marketing</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}>
                  <option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option><option>All Branches</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>Save Entry</button>
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
