import React, { useState, useEffect } from 'react'
import { getInvoices, getExpenses, getLedger, addLedgerEntry, getBranches } from '../lib/supabase'

const BLANK = {
  entry_date: new Date().toISOString().slice(0, 10),
  description: '', category: 'Other Income', branch_id: '',
  payment_mode: 'Cash', type: 'credit', amount: ''
}

export default function Accounting() {
  const [allRows, setAllRows] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [typeFilter, setTypeFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [inv, exp, led, br] = await Promise.all([getInvoices(), getExpenses(), getLedger(), getBranches()])
    setBranches(br.data || [])
    const combined = []

    ;(inv.data || []).forEach(i => combined.push({
      id: 'inv-' + i.id, source: 'Invoice', date: i.invoice_date,
      description: `${i.invoice_number} — ${i.customers?.name || 'Customer'}`,
      category: 'Service Income', branch: i.branches?.name || 'All', branch_id: i.branch_id,
      mode: i.payment_mode, debit: 0, credit: i.status === 'paid' ? Number(i.total) : 0,
      pending: i.status === 'pending', status: i.status,
    }))
    ;(exp.data || []).forEach(e => combined.push({
      id: 'exp-' + e.id, source: 'Expense', date: e.expense_date, description: e.description,
      category: e.category, branch: e.branches?.name || 'All', branch_id: e.branch_id,
      mode: e.payment_mode, debit: Number(e.amount), credit: 0,
    }))
    ;(led.data || []).forEach(l => combined.push({
      id: 'led-' + l.id, source: 'Manual', date: l.entry_date, description: l.description,
      category: l.category, branch: l.branches?.name || 'All', branch_id: l.branch_id,
      mode: l.payment_mode, debit: Number(l.debit || 0), credit: Number(l.credit || 0),
    }))

    combined.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    setAllRows(combined)
    setLoading(false)
  }

  // Apply branch filter first
  const branchRows = branchFilter === 'all' ? allRows : allRows.filter(r => r.branch_id === branchFilter)

  const totalCredit = branchRows.reduce((s, r) => s + r.credit, 0)
  const totalDebit = branchRows.reduce((s, r) => s + r.debit, 0)
  const netProfit = totalCredit - totalDebit
  const pendingCount = branchRows.filter(r => r.pending).length

  // Per-branch collection summary
  const branchSummary = branches.map(b => {
    const rows = allRows.filter(r => r.branch_id === b.id)
    return {
      name: b.name,
      income: rows.reduce((s, r) => s + r.credit, 0),
      expense: rows.reduce((s, r) => s + r.debit, 0),
    }
  })

  // Then type filter
  const filtered = typeFilter === 'all' ? branchRows : branchRows.filter(r => typeFilter === 'credit' ? r.credit > 0 : r.debit > 0)

  const save = async () => {
    if (!form.description || !form.amount) return
    setSaving(true)
    const amount = Number(form.amount)
    await addLedgerEntry({
      entry_date: form.entry_date, description: form.description, category: form.category,
      branch_id: form.branch_id || null, payment_mode: form.payment_mode,
      debit: form.type === 'debit' ? amount : 0, credit: form.type === 'credit' ? amount : 0,
    })
    await load()
    setModal(false); setForm(BLANK); setSaving(false)
  }

  const fmt = n => Number(n) > 0 ? `₹${Number(n).toLocaleString('en-IN')}` : '—'
  const SOURCE_BADGE = {
    Invoice: <span className="badge badge-success" style={{ fontSize: 10 }}>Invoice</span>,
    Expense: <span className="badge badge-danger" style={{ fontSize: 10 }}>Expense</span>,
    Manual: <span className="badge badge-info" style={{ fontSize: 10 }}>Manual</span>,
  }

  const exportCSV = () => {
    const r = [['Date', 'Source', 'Description', 'Category', 'Branch', 'Mode', 'Debit', 'Credit']]
    filtered.forEach(x => r.push([x.date, x.source, x.description, x.category, x.branch, x.mode, x.debit, x.credit]))
    const csv = r.map(row => row.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'accounting-ledger.csv'; a.click()
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading accounting...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Accounting & Ledger</div>
          <div className="page-sub">Invoices + Expenses automatically yahan dikhte hain</div>
        </div>
        <div className="flex-gap">
          <button className="btn" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setForm(BLANK); setModal(true) }}>+ Manual Entry</button>
        </div>
      </div>

      {/* Per-branch collection cards */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Branch-wise Collection</div>
        <div className="grid-2" style={{ gap: 10 }}>
          {branchSummary.map(b => (
            <div key={b.name} style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, cursor: 'pointer', border: branchFilter !== 'all' && branches.find(x => x.id === branchFilter)?.name === b.name ? '2px solid var(--pink)' : '2px solid transparent' }}
              onClick={() => { const bid = branches.find(x => x.name === b.name)?.id; setBranchFilter(branchFilter === bid ? 'all' : bid) }}>
              <div className="fw-600" style={{ fontSize: 13, marginBottom: 8 }}>{b.name}</div>
              <div className="flex-between" style={{ fontSize: 12 }}>
                <span className="text-success">↑ ₹{b.income.toLocaleString('en-IN')}</span>
                <span className="text-danger">↓ ₹{b.expense.toLocaleString('en-IN')}</span>
                <span className="fw-600">Net: ₹{(b.income - b.expense).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-item"><div className="summary-item-label">Total Income {branchFilter !== 'all' && '(filtered)'}</div><div className="summary-item-value text-success">₹{totalCredit.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Total Expenses {branchFilter !== 'all' && '(filtered)'}</div><div className="summary-item-value text-danger">₹{totalDebit.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Net Profit</div><div className="summary-item-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>₹{Math.abs(netProfit).toLocaleString('en-IN')}</div></div>
      </div>

      {pendingCount > 0 && (
        <div style={{ background: 'var(--warning-bg)', color: '#92400e', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
          ⚠️ {pendingCount} pending invoice(s) — income tab count hogi jab "Paid" mark karoge.
        </div>
      )}

      <div className="filter-bar">
        <select className="select" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">Sab Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">Sab Transactions</option>
          <option value="credit">Sirf Income</option>
          <option value="debit">Sirf Expenses</option>
        </select>
        <span className="text-muted" style={{ fontSize: 12 }}>{filtered.length} entries</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">📊</div><div>Koi transaction nahi.<br/><small className="text-muted">Invoice ya Expense banao — yahan apne aap aa jayega!</small></div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Source</th><th>Description</th><th>Category</th><th>Branch</th><th>Mode</th><th>Debit (₹)</th><th>Credit (₹)</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="text-muted mono">{r.date}</td>
                    <td>{SOURCE_BADGE[r.source]}</td>
                    <td className="fw-600">{r.description} {r.pending && <span className="badge badge-warning" style={{ fontSize: 9, marginLeft: 4 }}>Pending</span>}</td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{r.category}</td>
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
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Manual Entry (Extra Income/Expense)</div><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
            <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              💡 Sirf un cheezon ke liye jo Invoice/Expense mein nahi aati — jaise owner ne cash diya ya adjustment.
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Type</label>
                <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="credit">Income / Credit</option><option value="debit">Expense / Debit</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Description *</label><input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option>Other Income</option><option>Owner Investment</option><option>Adjustment</option><option>Refund</option><option>Other</option>
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
