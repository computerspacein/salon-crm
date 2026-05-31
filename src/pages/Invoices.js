import React, { useState } from 'react'

const INIT = [
  { id: 'INV-1042', customer: 'Priya Sharma', phone: '98765-43210', services: 'Hair Color, Cut', branch: 'Sector 17', date: '2026-05-31', subtotal: 1800, discount: 0, gst: 324, total: 2124, payment: 'UPI', status: 'paid', notes: '' },
  { id: 'INV-1043', customer: 'Meena Gupta', phone: '87654-32109', services: 'Facial, Waxing', branch: 'Sector 35', date: '2026-05-31', subtotal: 950, discount: 0, gst: 171, total: 1121, payment: 'Cash', status: 'paid', notes: '' },
  { id: 'INV-1044', customer: 'Sunita Rani', phone: '76543-21098', services: 'Bridal Trial', branch: 'Mohali', date: '2026-05-31', subtotal: 3500, discount: 0, gst: 630, total: 4130, payment: 'Card', status: 'pending', notes: 'Bridal on June 5' },
  { id: 'INV-1041', customer: 'Neelam Kapoor', phone: '65432-10987', services: 'Keratin, Olaplex', branch: 'Sector 17', date: '2026-05-30', subtotal: 4800, discount: 200, gst: 828, total: 5428, payment: 'UPI', status: 'paid', notes: '' },
]

const STATUS_BADGE = {
  paid: <span className="badge badge-success">Paid</span>,
  pending: <span className="badge badge-warning">Pending</span>,
  cancelled: <span className="badge badge-danger">Cancelled</span>,
}

const BLANK = {
  customer: '', phone: '', services: '', branch: 'Sector 17',
  date: new Date().toISOString().slice(0, 10),
  subtotal: '', discount: 0, gstPct: 18,
  payment: 'Cash', status: 'paid', notes: ''
}

let invoiceCounter = 1045

export default function Invoices() {
  const [invoices, setInvoices] = useState(INIT)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Auto calculate
  const subtotalNum = Number(form.subtotal) || 0
  const discountNum = Number(form.discount) || 0
  const gstPctNum = Number(form.gstPct) || 0
  const afterDiscount = subtotalNum - discountNum
  const gstAmount = Math.round((afterDiscount * gstPctNum) / 100)
  const totalAmount = afterDiscount + gstAmount

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (search && !inv.customer.toLowerCase().includes(search.toLowerCase()) && !inv.id.includes(search)) return false
    return true
  })

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0)

  const save = () => {
    if (!form.customer || !form.services || !form.subtotal) return
    if (editItem) {
      setInvoices(p => p.map(inv => inv.id === editItem.id ? {
        ...inv,
        customer: form.customer, phone: form.phone, services: form.services,
        branch: form.branch, date: form.date, payment: form.payment,
        status: form.status, notes: form.notes,
        subtotal: subtotalNum, discount: discountNum,
        gst: gstAmount, total: totalAmount
      } : inv))
    } else {
      invoiceCounter++
      const newInv = {
        id: `INV-${invoiceCounter}`,
        customer: form.customer, phone: form.phone, services: form.services,
        branch: form.branch, date: form.date, payment: form.payment,
        status: form.status, notes: form.notes,
        subtotal: subtotalNum, discount: discountNum,
        gst: gstAmount, total: totalAmount
      }
      setInvoices(p => [newInv, ...p])
    }
    setModal(false); setForm(BLANK); setEditItem(null)
  }

  const openEdit = (inv) => {
    setEditItem(inv)
    setForm({
      customer: inv.customer, phone: inv.phone, services: inv.services,
      branch: inv.branch, date: inv.date, subtotal: inv.subtotal,
      discount: inv.discount, gstPct: 18, payment: inv.payment,
      status: inv.status, notes: inv.notes || ''
    })
    setModal(true)
    setPreview(null)
  }

  const deleteInvoice = (id) => {
    setInvoices(p => p.filter(inv => inv.id !== id))
    setDeleteConfirm(null)
    setPreview(null)
  }

  const printInvoice = (inv) => {
    const printContent = `
      <html><head><title>${inv.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a0a2e; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 700; color: #E91E8C; }
        .title { font-size: 22px; font-weight: 600; margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f6f4f9; padding: 10px; text-align: left; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #e8e4f0; }
        .total-row { font-weight: 700; font-size: 16px; }
        .footer { margin-top: 40px; text-align: center; color: #7c6d9a; font-size: 12px; }
        .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .paid { background: #dcfce7; color: #166534; }
        .pending { background: #fef3c7; color: #92400e; }
      </style></head><body>
      <div class="header">
        <div>
          <div class="logo">✂ GlamSync</div>
          <div style="color:#7c6d9a;font-size:13px">${inv.branch}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700">${inv.id}</div>
          <div style="color:#7c6d9a;font-size:13px">${inv.date}</div>
          <span class="badge ${inv.status}">${inv.status.toUpperCase()}</span>
        </div>
      </div>
      <div class="info-row">
        <div><div style="color:#7c6d9a;font-size:12px;margin-bottom:4px">Bill To</div>
          <div style="font-weight:600;font-size:16px">${inv.customer}</div>
          <div style="color:#7c6d9a">${inv.phone || ''}</div>
        </div>
        <div style="text-align:right"><div style="color:#7c6d9a;font-size:12px;margin-bottom:4px">Payment Mode</div>
          <div style="font-weight:600">${inv.payment}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td>${inv.services}</td><td style="text-align:right">₹${inv.subtotal.toLocaleString('en-IN')}</td></tr>
          ${inv.discount > 0 ? `<tr><td style="color:#7c6d9a">Discount</td><td style="text-align:right;color:#ef4444">- ₹${inv.discount.toLocaleString('en-IN')}</td></tr>` : ''}
          <tr><td style="color:#7c6d9a">GST (18%)</td><td style="text-align:right;color:#7c6d9a">₹${inv.gst.toLocaleString('en-IN')}</td></tr>
          <tr class="total-row"><td>Total</td><td style="text-align:right;color:#E91E8C">₹${inv.total.toLocaleString('en-IN')}</td></tr>
        </tbody>
      </table>
      ${inv.notes ? `<div style="background:#f6f4f9;padding:12px;border-radius:8px;font-size:13px;color:#7c6d9a">Notes: ${inv.notes}</div>` : ''}
      <div class="footer">
        <div>GlamSync Salon — ${inv.branch}</div>
        <div style="margin-top:4px">Dhanyavaad! Aapka dobara swagat hai 🙏</div>
      </div>
      </body></html>
    `
    const w = window.open('', '_blank')
    w.document.write(printContent)
    w.document.close()
    w.print()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Invoices</div><div className="page-sub">{invoices.length} invoices</div></div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(BLANK); setModal(true) }}>+ Naya Invoice Banao</button>
      </div>

      <div className="summary-strip">
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
              <tr><th>Invoice #</th><th>Customer</th><th>Services</th><th>Branch</th><th>Date</th><th>Subtotal</th><th>Discount</th><th>GST</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="mono text-pink fw-600" style={{ cursor: 'pointer' }} onClick={() => setPreview(inv)}>{inv.id}</td>
                  <td className="fw-600">{inv.customer}</td>
                  <td className="text-muted">{inv.services}</td>
                  <td>{inv.branch}</td>
                  <td className="text-muted">{inv.date}</td>
                  <td className="mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="mono" style={{ color: 'var(--danger)' }}>{inv.discount > 0 ? `- ₹${inv.discount.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="mono text-muted">₹{inv.gst.toLocaleString('en-IN')}</td>
                  <td className="mono fw-600">₹{inv.total.toLocaleString('en-IN')}</td>
                  <td>{inv.payment}</td>
                  <td>{STATUS_BADGE[inv.status]}</td>
                  <td>
                    <div className="flex-gap">
                      <button className="btn btn-sm" onClick={() => setPreview(inv)}>👁️</button>
                      <button className="btn btn-sm" onClick={() => openEdit(inv)}>✏️</button>
                      <button className="btn btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(inv)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">{editItem ? `Invoice Edit — ${editItem.id}` : 'Naya Invoice Banao'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>

            <div className="form-grid">
              <div className="form-group"><label className="label">Customer Naam *</label><input className="input" placeholder="jaise: Priya Sharma" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Phone</label><input className="input" placeholder="98765-43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group full"><label className="label">Services *</label><input className="input" placeholder="jaise: Hair Color, Cut, Facial" value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Branch</label>
                <select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}>
                  <option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Subtotal (₹) *</label><input type="number" className="input" placeholder="0" value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Discount (₹)</label><input type="number" className="input" placeholder="0" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">GST (%)</label>
                <select className="select" value={form.gstPct} onChange={e => setForm(p => ({ ...p, gstPct: e.target.value }))}>
                  <option value="0">0% (No GST)</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.payment} onChange={e => setForm(p => ({ ...p, payment: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Online</option><option>Cheque</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group full"><label className="label">Notes</label><textarea className="textarea" placeholder="Koi additional info..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>

            {/* Live Preview of amounts */}
            {subtotalNum > 0 && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>AMOUNT SUMMARY</div>
                <div className="flex-between" style={{ fontSize: 13, marginBottom: 4 }}>
                  <span>Subtotal</span><span className="mono">₹{subtotalNum.toLocaleString('en-IN')}</span>
                </div>
                {discountNum > 0 && <div className="flex-between" style={{ fontSize: 13, marginBottom: 4, color: 'var(--danger)' }}>
                  <span>Discount</span><span className="mono">- ₹{discountNum.toLocaleString('en-IN')}</span>
                </div>}
                {gstPctNum > 0 && <div className="flex-between" style={{ fontSize: 13, marginBottom: 4, color: 'var(--text-muted)' }}>
                  <span>GST ({gstPctNum}%)</span><span className="mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>}
                <div className="divider" />
                <div className="flex-between" style={{ fontSize: 16, fontWeight: 700, color: 'var(--pink)' }}>
                  <span>Total</span><span className="mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>{editItem ? 'Update Karo' : 'Invoice Banao'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Invoice Preview</div>
              <button className="modal-close" onClick={() => setPreview(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 20 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pink)' }}>✂ GlamSync</div>
                  <div className="text-muted">{preview.branch}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="fw-600 mono">{preview.id}</div>
                  <div className="text-muted">{preview.date}</div>
                  {STATUS_BADGE[preview.status]}
                </div>
              </div>

              <div className="divider" />

              <div className="flex-between" style={{ margin: '14px 0' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>BILL TO</div>
                  <div className="fw-600" style={{ fontSize: 15 }}>{preview.customer}</div>
                  <div className="text-muted">{preview.phone || ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>PAYMENT MODE</div>
                  <div className="fw-600">{preview.payment}</div>
                </div>
              </div>

              <div className="divider" />

              <div style={{ margin: '14px 0' }}>
                <div className="text-muted" style={{ fontSize: 11, marginBottom: 8 }}>SERVICES</div>
                <div style={{ fontSize: 14 }}>{preview.services}</div>
              </div>

              <div className="divider" />

              <div style={{ fontSize: 13 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span className="text-muted">Subtotal</span>
                  <span className="mono">₹{preview.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {preview.discount > 0 && <div className="flex-between" style={{ marginBottom: 6, color: 'var(--danger)' }}>
                  <span>Discount</span><span className="mono">- ₹{preview.discount.toLocaleString('en-IN')}</span>
                </div>}
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span className="text-muted">GST (18%)</span>
                  <span className="mono text-muted">₹{preview.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="divider" />
                <div className="flex-between" style={{ fontSize: 18, fontWeight: 700, color: 'var(--pink)' }}>
                  <span>Total</span>
                  <span className="mono">₹{preview.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {preview.notes && (
                <div style={{ marginTop: 14, background: 'white', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                  📝 {preview.notes}
                </div>
              )}

              <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Dhanyavaad! Aapka dobara swagat hai 🙏
              </div>
            </div>

            <div className="gap-btn" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => printInvoice(preview)}>🖨️ Print / Download</button>
              <button className="btn" onClick={() => openEdit(preview)}>✏️ Edit</button>
              <button className="btn" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setDeleteConfirm(preview)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Invoice Delete Karna Chahte Ho?</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text)' }}>{deleteConfirm.id}</strong> — {deleteConfirm.customer} ka invoice permanently delete ho jayega.
            </div>
            <div className="gap-btn">
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }} onClick={() => deleteInvoice(deleteConfirm.id)}>Haan, Delete Karo</button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
