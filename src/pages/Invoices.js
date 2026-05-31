import React, { useState } from 'react'

const INIT = [
  { id: 'INV-1042', customer: 'Priya Sharma', services: 'Hair Color, Cut', branch: 'Sector 17', date: '2026-05-31', subtotal: 1800, gst: 324, total: 2124, payment: 'UPI', status: 'paid' },
  { id: 'INV-1043', customer: 'Meena Gupta', services: 'Facial, Waxing', branch: 'Sector 35', date: '2026-05-31', subtotal: 950, gst: 171, total: 1121, payment: 'Cash', status: 'paid' },
  { id: 'INV-1044', customer: 'Sunita Rani', services: 'Bridal Trial', branch: 'Mohali', date: '2026-05-31', subtotal: 3500, gst: 630, total: 4130, payment: 'Card', status: 'pending' },
  { id: 'INV-1041', customer: 'Neelam Kapoor', services: 'Keratin, Olaplex', branch: 'Sector 17', date: '2026-05-30', subtotal: 4800, gst: 864, total: 5664, payment: 'UPI', status: 'paid' },
  { id: 'INV-1040', customer: 'Kavita Singh', services: 'Mani-Pedi, Eyebrows', branch: 'Panchkula', date: '2026-05-29', subtotal: 850, gst: 153, total: 1003, payment: 'Cash', status: 'paid' },
]

const STATUS_BADGE = {
  paid: <span className="badge badge-success">Paid</span>,
  pending: <span className="badge badge-warning">Pending</span>,
  cancelled: <span className="badge badge-danger">Cancelled</span>,
}

export default function Invoices() {
  const [invoices] = useState(INIT)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [preview, setPreview] = useState(null)

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (search && !inv.customer.toLowerCase().includes(search.toLowerCase()) && !inv.id.includes(search)) return false
    return true
  })

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">{filtered.length} invoices</div>
        </div>
      </div>

      <div className="summary-strip" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="summary-item"><div className="summary-item-label">Paid</div><div className="summary-item-value text-success">₹{totalPaid.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Pending</div><div className="summary-item-value" style={{ color: 'var(--warning)' }}>₹{totalPending.toLocaleString('en-IN')}</div></div>
        <div className="summary-item"><div className="summary-item-label">Total Invoices</div><div className="summary-item-value">{invoices.length}</div></div>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Invoice # ya customer..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Sab Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Invoice #</th><th>Customer</th><th>Services</th><th>Branch</th><th>Date</th><th>Subtotal</th><th>GST (18%)</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="mono text-pink fw-600">{inv.id}</td>
                  <td className="fw-600">{inv.customer}</td>
                  <td className="text-muted">{inv.services}</td>
                  <td>{inv.branch}</td>
                  <td className="text-muted">{inv.date}</td>
                  <td className="mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="mono text-muted">₹{inv.gst.toLocaleString('en-IN')}</td>
                  <td className="mono fw-600">₹{inv.total.toLocaleString('en-IN')}</td>
                  <td>{inv.payment}</td>
                  <td>{STATUS_BADGE[inv.status]}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => setPreview(inv)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Invoice — {preview.id}</div>
              <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 20, fontSize: 13 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pink)' }}>GlamSync</div>
                  <div className="text-muted">{preview.branch}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fw-600">{preview.id}</div>
                  <div className="text-muted">{preview.date}</div>
                  {STATUS_BADGE[preview.status]}
                </div>
              </div>
              <div className="divider" />
              <div className="flex-between" style={{ margin: '12px 0' }}>
                <div><div className="text-muted">Bill To</div><div className="fw-600">{preview.customer}</div></div>
                <div style={{ textAlign: 'right' }}><div className="text-muted">Payment Mode</div><div className="fw-600">{preview.payment}</div></div>
              </div>
              <div className="divider" />
              <table style={{ width: '100%', fontSize: 13 }}>
                <tr><td>Services</td><td style={{ textAlign: 'right' }} className="mono">₹{preview.subtotal.toLocaleString('en-IN')}</td></tr>
                <tr><td className="text-muted">GST @ 18%</td><td style={{ textAlign: 'right' }} className="mono text-muted">₹{preview.gst.toLocaleString('en-IN')}</td></tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="fw-600" style={{ paddingTop: 8 }}>Total</td>
                  <td style={{ textAlign: 'right', paddingTop: 8 }} className="mono fw-600" >₹{preview.total.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print</button>
              <button className="btn" onClick={() => setPreview(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
