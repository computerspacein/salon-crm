import React, { useState, useEffect } from 'react'
import { getCustomers, addCustomer, getServices, getBranches, addInvoice, updateCustomer } from '../lib/supabase'

export default function QuickBilling({ branch }) {
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [matchedCustomer, setMatchedCustomer] = useState(null)
  const [lineItems, setLineItems] = useState([]) // {id, name, price}
  const [discountType, setDiscountType] = useState('fixed') // fixed | percent
  const [discountValue, setDiscountValue] = useState(0)
  const [branchId, setBranchId] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [saving, setSaving] = useState(false)
  const [lastBill, setLastBill] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [c, s, b] = await Promise.all([getCustomers(), getServices(), getBranches()])
    setCustomers(c.data || [])
    setServices(s.data || [])
    setBranches(b.data || [])
    if (b.data && b.data.length) setBranchId(branch && branch !== 'all' ? branch : b.data[0].id)
    setLoading(false)
  }

  // Auto-fill customer on phone change
  const onPhoneChange = (val) => {
    setPhone(val)
    const found = customers.find(c => c.phone && c.phone.replace(/[^0-9]/g, '') === val.replace(/[^0-9]/g, '') && val.length >= 6)
    if (found) {
      setMatchedCustomer(found)
      setName(found.name)
    } else {
      setMatchedCustomer(null)
    }
  }

  const addService = (svc) => {
    setLineItems(p => [...p, { lineId: Date.now() + Math.random(), id: svc.id, name: svc.name, price: Number(svc.price_min) }])
  }

  const removeItem = (lineId) => setLineItems(p => p.filter(i => i.lineId !== lineId))
  const updatePrice = (lineId, price) => setLineItems(p => p.map(i => i.lineId === lineId ? { ...i, price: Number(price) } : i))

  const subtotal = lineItems.reduce((s, i) => s + Number(i.price || 0), 0)
  const discountAmount = discountType === 'percent'
    ? Math.round((subtotal * Number(discountValue || 0)) / 100)
    : Number(discountValue || 0)
  const total = Math.max(0, subtotal - discountAmount)

  const reset = () => {
    setPhone(''); setName(''); setMatchedCustomer(null); setLineItems([])
    setDiscountType('fixed'); setDiscountValue(0); setPaymentMode('Cash')
  }

  const generateBill = async () => {
    if (!name || lineItems.length === 0) return alert('Customer naam aur kam se kam ek service add karo')
    setSaving(true)

    // 1. Customer: existing ya naya
    let customerId = matchedCustomer?.id
    let custObj = matchedCustomer
    if (!customerId) {
      const { data } = await addCustomer({ name, phone, email: '', notes: '' })
      custObj = data?.[0]
      customerId = custObj?.id
    }

    // 2. Invoice banao (GST = 0, no tax)
    const servicesText = lineItems.map(i => i.name).join(', ')
    const invoicePayload = {
      invoice_number: `BILL-${Date.now().toString().slice(-6)}`,
      customer_id: customerId || null,
      branch_id: branchId || null,
      subtotal: subtotal,
      discount: discountAmount,
      gst_pct: 0,
      gst_amount: 0,
      total: total,
      payment_mode: paymentMode,
      status: 'paid',
      invoice_date: new Date().toISOString().slice(0, 10),
    }
    const { data: invData } = await addInvoice(invoicePayload)

    // 3. Loyalty points update (10 per ₹100 + 50 visit bonus)
    if (customerId && custObj) {
      const earned = Math.floor(total / 100) * 10 + 50
      await updateCustomer(customerId, {
        loyalty_points: (custObj.loyalty_points || 0) + earned,
        total_visits: (custObj.total_visits || 0) + 1,
        total_spent: (custObj.total_spent || 0) + total,
      })
    }

    const branchName = branches.find(b => b.id === branchId)?.name || ''
    setLastBill({
      invoice_number: invoicePayload.invoice_number,
      name, phone, servicesText, lineItems: [...lineItems],
      subtotal, discountAmount, total, paymentMode, branchName,
      date: invoicePayload.invoice_date
    })
    setSaving(false)
    reset()
    await load()
  }

  const printBill = () => {
    if (!lastBill) return
    const itemsHtml = lastBill.lineItems.map(i => `<tr><td>${i.name}</td><td style="text-align:right">₹${Number(i.price).toLocaleString('en-IN')}</td></tr>`).join('')
    const content = `
      <html><head><title>${lastBill.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1a0a2e; max-width: 380px; }
        .logo { font-size: 22px; font-weight: 700; color: #E91E8C; text-align:center; }
        .sub { text-align:center; color:#7c6d9a; font-size:12px; margin-bottom:16px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 6px 0; border-bottom: 1px dashed #ddd; font-size: 13px; }
        .total-row td { font-weight: 700; font-size: 15px; border-bottom: none; padding-top: 10px; }
        .footer { margin-top: 20px; text-align: center; color: #7c6d9a; font-size: 11px; }
      </style></head><body>
      <div class="logo">✂ Scissors Masterz</div>
      <div class="sub">${lastBill.branchName}<br>${lastBill.date} · ${lastBill.invoice_number}</div>
      <div style="font-size:13px;margin-bottom:10px"><strong>${lastBill.name}</strong><br>${lastBill.phone}</div>
      <table>
        ${itemsHtml}
        <tr><td>Subtotal</td><td style="text-align:right">₹${lastBill.subtotal.toLocaleString('en-IN')}</td></tr>
        ${lastBill.discountAmount > 0 ? `<tr><td style="color:#ef4444">Discount</td><td style="text-align:right;color:#ef4444">- ₹${lastBill.discountAmount.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL</td><td style="text-align:right;color:#E91E8C">₹${lastBill.total.toLocaleString('en-IN')}</td></tr>
        <tr><td>Payment</td><td style="text-align:right">${lastBill.paymentMode}</td></tr>
      </table>
      <div class="footer">Dhanyavaad! Aapka dobara swagat hai 🙏</div>
      </body></html>
    `
    const w = window.open('', '_blank')
    w.document.write(content); w.document.close(); w.print()
  }

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading...</div></div></div>

  // Group services by category
  const byCat = {}
  services.forEach(s => { (byCat[s.category] = byCat[s.category] || []).push(s) })

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Quick Billing</div><div className="page-sub">Fast bill banao — no GST</div></div>
      </div>

      <div className="grid-60-40">
        {/* LEFT: Service Picker */}
        <div className="card">
          <div className="card-title">Services Chuno</div>
          {services.length === 0 ? (
            <div className="empty-state"><div className="text-muted">Pehle Services page pe services add karo</div></div>
          ) : (
            Object.keys(byCat).map(cat => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div className="text-muted" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>{cat}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {byCat[cat].map(s => (
                    <button key={s.id} className="btn btn-sm" onClick={() => addService(s)}>
                      + {s.name} <span className="text-muted" style={{ marginLeft: 4 }}>₹{s.price_min}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: Bill */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">Bill Banao</div>

          {/* Customer */}
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="label">Phone Number</label>
            <input className="input" placeholder="98765-43210" value={phone} onChange={e => onPhoneChange(e.target.value)} />
            {matchedCustomer && <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 4 }}>✓ Existing customer mila — {matchedCustomer.loyalty_points || 0} loyalty pts</div>}
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="label">Customer Name</label>
            <input className="input" placeholder="Naam" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="divider" />

          {/* Line Items */}
          {lineItems.length === 0 ? (
            <div className="text-muted" style={{ fontSize: 13, textAlign: 'center', padding: '14px 0' }}>Left se services add karo</div>
          ) : (
            <div style={{ marginBottom: 10 }}>
              {lineItems.map(i => (
                <div key={i.lineId} className="flex-between" style={{ marginBottom: 8, gap: 8 }}>
                  <span style={{ fontSize: 13, flex: 1 }}>{i.name}</span>
                  <input type="number" className="input" style={{ width: 80, padding: '4px 8px', fontSize: 12 }} value={i.price} onChange={e => updatePrice(i.lineId, e.target.value)} />
                  <button className="btn btn-sm" style={{ color: 'var(--danger)', padding: '4px 8px' }} onClick={() => removeItem(i.lineId)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="divider" />

          {/* Discount */}
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="label">Discount</label>
            <div className="flex-gap">
              <select className="select" style={{ width: 110 }} value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="fixed">₹ Fixed</option>
                <option value="percent">% Percent</option>
              </select>
              <input type="number" className="input" style={{ flex: 1 }} placeholder="0" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
            </div>
          </div>

          {/* Branch + Payment */}
          <div className="form-grid" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label className="label">Branch</label>
              <select className="select" value={branchId} onChange={e => setBranchId(e.target.value)}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Payment</label>
              <select className="select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option>Cash</option><option>UPI</option><option>Card</option><option>Online</option>
              </select>
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div className="flex-between" style={{ fontSize: 13, marginBottom: 6 }}><span className="text-muted">Subtotal</span><span className="mono">₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discountAmount > 0 && <div className="flex-between" style={{ fontSize: 13, marginBottom: 6, color: 'var(--danger)' }}><span>Discount {discountType === 'percent' ? `(${discountValue}%)` : ''}</span><span className="mono">- ₹{discountAmount.toLocaleString('en-IN')}</span></div>}
            <div className="divider" />
            <div className="flex-between" style={{ fontSize: 18, fontWeight: 700, color: 'var(--pink)' }}><span>Total</span><span className="mono">₹{total.toLocaleString('en-IN')}</span></div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={generateBill} disabled={saving}>{saving ? 'Saving...' : '💵 Generate Bill'}</button>
        </div>
      </div>

      {/* Success / Last Bill */}
      {lastBill && (
        <div className="card" style={{ marginTop: 16, borderColor: 'var(--success)' }}>
          <div className="flex-between">
            <div>
              <div className="fw-600" style={{ color: 'var(--success)' }}>✓ Bill Ready — {lastBill.invoice_number}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{lastBill.name} · {lastBill.servicesText} · <strong>₹{lastBill.total.toLocaleString('en-IN')}</strong></div>
            </div>
            <div className="flex-gap">
              <button className="btn btn-primary" onClick={printBill}>🖨️ Print Bill</button>
              <button className="btn" onClick={() => setLastBill(null)}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
