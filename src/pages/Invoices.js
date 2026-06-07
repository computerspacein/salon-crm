import React, { useState, useEffect } from 'react'
import { getInvoices, addInvoice, updateInvoice, deleteInvoice, getCustomers, getBranches } from '../lib/supabase'

const STATUS_BADGE = {
  paid: <span className="badge badge-success">Paid</span>,
  pending: <span className="badge badge-warning">Pending</span>,
  cancelled: <span className="badge badge-danger">Cancelled</span>,
}

const BLANK = {
  customer_id: '', branch_id: '', services_text: '',
  invoice_date: new Date().toISOString().slice(0, 10),
  subtotal: '', discount: 0, gst_pct: 18,
  payment_mode: 'Cash', status: 'paid'
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [inv, c, b] = await Promise.all([getInvoices(), getCustomers(), getBranches()])
    setInvoices(inv.data || [])
    setCustomers(c.data || [])
    setBranches(b.data || [])
    setLoading(false)
  }

  const subtotalNum = Number(form.subtotal) || 0
  const discountNum = Number(form.discount) || 0
  const gstPctNum = Number(form.gst_pct) || 0
  const afterDiscount = subtotalNum - discountNum
  const gstAmount = Math.round((afterDiscount * gstPctNum) / 100)
  const totalAmount = afterDiscount + gstAmount

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false
    if (search && !inv.customers?.name?.toLowerCase().includes(search.toLowerCase()) && !inv.invoice_number?.includes(search)) return false
    return true
  })

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.total), 0)

  const save = async () => {
    if (!form.customer_id || !form.subtotal) return
    setSaving(true)
    const payload = {
      invoice_number: editItem ? editItem.invoice_number : `INV-${Date.now().toString().slice(-6)}`,
      customer_id: form.customer_id || null,
      branch_id: form.branch_id || null,
      subtotal: subtotalNum,
      discount: discountNum,
      gst_pct: gstPctNum,
      gst_amount: gstAmount,
      total: totalAmount,
      payment_mode: form.payment_mode,
      status: form.status,
      invoice_date: form.invoice_date
    }
    if (editItem) { await updateInvoice(editItem.id, payload) }
    else { await addInvoice(payload) }
    await load()
    setModal(false); setForm(BLANK); setEditItem(null); setSaving(false)
  }

  const openEdit = (inv) => {
    setEditItem(inv)
    setForm({
      customer_id: inv.customer_id || '', branch_id: inv.branch_id || '',
      services_text: '', invoice_date: inv.invoice_date,
      subtotal: inv.subtotal, discount: inv.discount || 0, gst_pct: inv.gst_pct || 18,
      payment_mode: inv.payment_mode, status: inv.status
    })
    setModal(true); setPreview(null)
  }

  const confirmDelete = async () => {
    await deleteInvoice(deleteConfirm.id)
    await load()
    setDeleteConfirm(null); setPreview(null)
  }

  const printInvoice = (inv) => {
    const branchName = inv.branches?.name || ''
    const custName = inv.customers?.name || ''
    const custPhone = inv.customers?.phone || ''
    const printContent = `
      <html><head><title>${inv.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a0a2e; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 700; color: #E91E8C; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f6f4f9; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e8e4f0; }
        .total-row { font-weight: 700; font-size: 16px; }
        .footer { margin-top: 40px; text-align: center; color: #7c6d9a; font-size: 12px; }
      </style></head><body>
      <div class="header">
        <div><div class="logo">✂ Scissors Masterz</div><div style="color:#7c6d9a">${branchName}</div></div>
        <div style="text-align:right"><div style="font-size:20px;font-weight:700">${inv.invoice_number}</div><div style="color:#7c6d9a">${inv.invoice_date}</div></div>
      </div>
      <div style="margin:20px 0"><div style="color:#7c6d9a;font-size:12px">BILL TO</div><div style="font-weight:600;font-size:16px">${custName}</div><div style="color:#7c6d9a">${custPhone}</div></div>
      <table>
        <tr><td>Services</td><td style="text-align:right">₹${Number(inv.subtotal).toLocaleString('en-IN')}</td></tr>
        ${inv.discount > 0 ? `<tr><td style="color:#7c6d9a">Discount</td><td style="text-align:right;color:#ef4444">- ₹${Number(inv.discount).toLocaleString('en-IN')}</td></tr>` : ''}
        <tr><td style="color:#7c6d9a">GST (${inv.gst_pct}%)</td><td style="text-align:right;color:#7c6d9a">₹${Number(inv.gst_amount).toLocaleString('en-IN')}</td></tr>
        <tr class="total-row"><td>Total</td><td style="text-align:right;color:#E91E8C">₹${Number(inv.total).toLocaleString('en-IN')}</td></tr>
      </table>
      <div class="footer">Scissors Masterz Salon — ${branchName}<br>Dhanyavaad! Aapka dobara swagat hai 🙏</div>
      </body></html>
    `
    const w = window.open('', '_blank')
    w.document.write(printContent)
    w.document.close()
    w.print()
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading invoices...</div></div></div>

  const noCustomers = customers.length === 0

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

      {invoices.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">🧾</div><div>Koi invoice nahi — pehla invoice banao!</div></div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Invoice #</th><th>Customer</th><th>Branch</th><th>Date</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td className="mono text-pink fw-600" style={{ cursor: 'pointer' }} onClick={() => setPreview(inv)}>{inv.invoice_number}</td>
                    <td className="fw-600">{inv.customers?.name || 'Unknown'}</td>
                    <td>{inv.branches?.name || '—'}</td>
                    <td className="text-muted">{inv.invoice_date}</td>
                    <td className="mono">₹{Number(inv.subtotal).toLocaleString('en-IN')}</td>
                    <td className="mono text-muted">₹{Number(inv.gst_amount).toLocaleString('en-IN')}</td>
                    <td className="mono fw-600">₹{Number(inv.total).toLocaleString('en-IN')}</td>
                    <td>{inv.payment_mode}</td>
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
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">{editItem ? `Invoice Edit — ${editItem.invoice_number}` : 'Naya Invoice Banao'}</div>
              <button className="modal-close" onClick={() => { setModal(false); setEditItem(null) }}>✕</button>
            </div>

            {noCustomers && (
              <div style={{ background: 'var(--warning-bg)', color: '#92400e', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                ⚠️ Pehle <strong>Customers</strong> page pe customer add karo.
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full">
                <label className="label">Customer *</label>
                <select className="select" value={form.customer_id} onChange={e => setForm(p => ({ ...p, customer_id: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Branch</label>
                <select className="select" value={form.branch_id} onChange={e => setForm(p => ({ ...p, branch_id: e.target.value }))}>
                  <option value="">-- Branch chuno --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="label">Date</label><input type="date" className="input" value={form.invoice_date} onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Subtotal (₹) *</label><input type="number" className="input" value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Discount (₹)</label><input type="number" className="input" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} /></div>
              <div className="form-group"><label className="label">GST (%)</label>
                <select className="select" value={form.gst_pct} onChange={e => setForm(p => ({ ...p, gst_pct: e.target.value }))}>
                  <option value="0">0% (No GST)</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Payment Mode</label>
                <select className="select" value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}>
                  <option>Cash</option><option>UPI</option><option>Card</option><option>Online</option><option>Cheque</option>
                </select>
              </div>
              <div className="form-group"><label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="paid">Paid</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {subtotalNum > 0 && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div className="flex-between" style={{ fontSize: 13, marginBottom: 4 }}><span>Subtotal</span><span className="mono">₹{subtotalNum.toLocaleString('en-IN')}</span></div>
                {discountNum > 0 && <div className="flex-between" style={{ fontSize: 13, marginBottom: 4, color: 'var(--danger)' }}><span>Discount</span><span className="mono">- ₹{discountNum.toLocaleString('en-IN')}</span></div>}
                {gstPctNum > 0 && <div className="flex-between" style={{ fontSize: 13, marginBottom: 4, color: 'var(--text-muted)' }}><span>GST ({gstPctNum}%)</span><span className="mono">₹{gstAmount.toLocaleString('en-IN')}</span></div>}
                <div className="divider" />
                <div className="flex-between" style={{ fontSize: 16, fontWeight: 700, color: 'var(--pink)' }}><span>Total</span><span className="mono">₹{totalAmount.toLocaleString('en-IN')}</span></div>
              </div>
            )}

            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save} disabled={saving || noCustomers}>{saving ? 'Saving...' : editItem ? 'Update Karo' : 'Invoice Banao'}</button>
              <button className="btn" onClick={() => { setModal(false); setEditItem(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPreview(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header"><div className="modal-title">Invoice Preview</div><button className="modal-close" onClick={() => setPreview(null)}>✕</button></div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 20 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pink)' }}>✂ Scissors Masterz</div><div className="text-muted">{preview.branches?.name || ''}</div></div>
                <div style={{ textAlign: 'right' }}><div className="fw-600 mono">{preview.invoice_number}</div><div className="text-muted">{preview.invoice_date}</div>{STATUS_BADGE[preview.status]}</div>
              </div>
              <div className="divider" />
              <div style={{ margin: '14px 0' }}>
                <div className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>BILL TO</div>
                <div className="fw-600" style={{ fontSize: 15 }}>{preview.customers?.name}</div>
                <div className="text-muted">{preview.customers?.phone || ''}</div>
              </div>
              <div className="divider" />
              <div style={{ fontSize: 13, marginTop: 14 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}><span className="text-muted">Subtotal</span><span className="mono">₹{Number(preview.subtotal).toLocaleString('en-IN')}</span></div>
                {preview.discount > 0 && <div className="flex-between" style={{ marginBottom: 6, color: 'var(--danger)' }}><span>Discount</span><span className="mono">- ₹{Number(preview.discount).toLocaleString('en-IN')}</span></div>}
                <div className="flex-between" style={{ marginBottom: 6 }}><span className="text-muted">GST ({preview.gst_pct}%)</span><span className="mono text-muted">₹{Number(preview.gst_amount).toLocaleString('en-IN')}</span></div>
                <div className="divider" />
                <div className="flex-between" style={{ fontSize: 18, fontWeight: 700, color: 'var(--pink)' }}><span>Total</span><span className="mono">₹{Number(preview.total).toLocaleString('en-IN')}</span></div>
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

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><div className="modal-title">Invoice Delete Karna Chahte Ho?</div><button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}><strong>{deleteConfirm.invoice_number}</strong> permanently delete ho jayega.</div>
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
