import React, { useState, useEffect } from 'react'
import { getLedger, addLedgerEntry, getBranches } from '../lib/supabase'

const BLANK = {
  entry_date: new Date().toISOString().slice(0, 10),
  description: '', category: 'Service Income', branch_id: '',
  payment_mode: 'Cash', type: 'credit', amount: ''
}

export default function Accounting() {
  const [ledger, setLedger] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [l, b] = await Promise.all([getLedger(), getBranches()])
    setLedger(l.data || [])
    setBranches(b.data || [])
    setLoading(false)
  }

  const totalCredit = ledger.reduce((s, r) => s + Number(r.credit || 0), 0)
  const totalDebit = ledger.reduce((s, r) => s + Number(r.debit || 0), 0)
  const netProfit = totalCredit - totalDebit

  const filtered = filter === 'all' ? ledger : ledger.filter(r => filter === 'credit' ? r.credit > 0 : r.debit > 0)

  const save = async () => {
    if (!form.description || !form.amount) return
    setSaving(true)
    const amount = Number(form.amount)
    const payload = {
      entry_date: form.entry_date,
      description: form.description,
      category: form.category,
      branch_id: form.branch_id || null,
      payment_mode: form.payment_mode,
      debit: form.type === 'debit' ? amount : 0,
      credit: form.type === 'credit' ? amount : 0,
    }
    await addLedgerEntry(payload)
    await load()
    setModal(false); setForm(BLANK); setSaving(false)
  }

  const fmt = n => Number(n) > 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—'

  const exportCSV = () => {
    const rows = [['Date', 'Description', 'Category', 'Branch', 'Mode', 'Debit', 'Credit']]
    ledger.forEach(r => rows.push([r.entry_date, r.description, r.category, r.branches?.name || '', r.payment_mode, r.debit, r.credit]))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ledger.csv'; a.click()
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading ledger...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Accounting & Ledger</div><div className="page-sub">Pura Hisaab</div></div>
        <div className="flex-gap">
          <button className="btn" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setForm(BLANK); setModal(true) }}>+ Add Entry</button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-item"><div className="summary-item-label">Total Income</div><div className="summary-item-value text-success">₹{totalCredit.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Total Expenses</div><div className="summary-item-value text-danger">₹{totalDebit.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Net Profit</div><div className="summary-item-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>₹{Math.abs(netProfit).toLocaleString('en-IN')}</div></div>
      </div>

      <div className="filter-bar">
        <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Sab Transactions</option>
          <option value="credit">Sirf Income</option>
          <option value="debit">Sirf Expenses</option>
        </select>
      </div>

      {ledger.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📊</div><div>Koi entry nahi — pehli entry add karo!</div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Debit (₹)</th><th>Credit (₹)</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="text-muted mono">{r.entry_date}</td>
                    <td className="fw-600">{r.description}</td>
                    <td><span className="badge badge-info">{r.category}</span></td>
                    <td>{r.branches?.name || 'All'}</td>
                    <td>{r.payment_mode}</td>
                    <td className="debit">{fmt(r.debit)}</td>
                    <td className="credit">{fmt(r.credit)}</td>
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
            <div className="modal-header"><div className="modal-title">Naya Accounting Entry</div><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Type</label>
                <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="credit">Income / Credit</option>
                  <option value="debit">Expense / Debit</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option>Service Income</option><option>Product Sales</option><option>Rent</option><option>Payroll</option><option>Inventory</option><option>Utilities</option><option>Marketing</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.entry_date} onChange={e => setForm(p => ({ ...p, entry_date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Cheque</option>
                </select>
              </div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Entry'}</button>
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
