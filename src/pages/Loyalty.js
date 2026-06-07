import React, { useState, useEffect } from 'react'
import { getCustomers, updateCustomer } from '../lib/supabase'

const getTier = (points) => {
  if (points >= 6000) return { name: 'Diamond', icon: '👑', color: '#6366f1', bg: '#eef2ff', next: null, nextAt: null }
  if (points >= 3000) return { name: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#fef3c7', next: 'Diamond', nextAt: 6000 }
  if (points >= 1000) return { name: 'Silver', icon: '🥈', color: '#6b7280', bg: '#f3f4f6', next: 'Gold', nextAt: 3000 }
  return { name: 'Bronze', icon: '🥉', color: '#92400e', bg: '#fef3c7', next: 'Silver', nextAt: 1000 }
}
const pointsToDiscount = (points) => Math.floor(points / 100) * 10

export default function Loyalty() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [redeemModal, setRedeemModal] = useState(false)
  const [addForm, setAddForm] = useState({ customerId: '', amount: '', visitBonus: true })
  const [redeemForm, setRedeemForm] = useState({ customerId: '', points: '' })
  const [tierFilter, setTierFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await getCustomers()
    setCustomers(data || [])
    setLoading(false)
  }

  const filtered = customers.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
    if (tierFilter === 'all') return matchSearch
    return matchSearch && getTier(c.loyalty_points || 0).name === tierFilter
  })

  const addPoints = async () => {
    const cust = customers.find(c => c.id === addForm.customerId)
    if (!cust || !addForm.amount) return
    setSaving(true)
    const earned = Math.floor(Number(addForm.amount) / 100) * 10
    const visitBonus = addForm.visitBonus ? 50 : 0
    const total = earned + visitBonus
    await updateCustomer(cust.id, {
      loyalty_points: (cust.loyalty_points || 0) + total,
      total_visits: addForm.visitBonus ? (cust.total_visits || 0) + 1 : (cust.total_visits || 0),
      total_spent: (cust.total_spent || 0) + Number(addForm.amount),
    })
    await load()
    setAddModal(false)
    setAddForm({ customerId: '', amount: '', visitBonus: true })
    setSaving(false)
    if (selected?.id === cust.id) setSelected(null)
  }

  const redeemPoints = async () => {
    const cust = customers.find(c => c.id === redeemForm.customerId)
    if (!cust || !redeemForm.points) return
    const pts = Number(redeemForm.points)
    if (pts > (cust.loyalty_points || 0)) return alert('Itne points nahi hain!')
    if (pts % 100 !== 0) return alert('Points 100 ke multiple mein hone chahiye!')
    setSaving(true)
    await updateCustomer(cust.id, { loyalty_points: (cust.loyalty_points || 0) - pts })
    await load()
    setRedeemModal(false)
    setRedeemForm({ customerId: '', points: '' })
    setSaving(false)
    if (selected?.id === cust.id) setSelected(null)
  }

  const totalPointsIssued = customers.reduce((s, c) => s + (c.loyalty_points || 0), 0)
  const diamondCount = customers.filter(c => getTier(c.loyalty_points || 0).name === 'Diamond').length
  const goldCount = customers.filter(c => getTier(c.loyalty_points || 0).name === 'Gold').length

  if (loading) return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div>Loading loyalty data...</div></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Loyalty Program</div><div className="page-sub">Points earn karo, discount pao</div></div>
        <div className="flex-gap">
          <button className="btn" onClick={() => setRedeemModal(true)}>🎁 Points Redeem Karo</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Points Add Karo</button>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric"><div className="metric-label">Total Points Issued</div><div className="metric-value">{totalPointsIssued.toLocaleString('en-IN')}</div></div>
        <div className="metric"><div className="metric-label">👑 Diamond Members</div><div className="metric-value" style={{ color: '#6366f1' }}>{diamondCount}</div></div>
        <div className="metric"><div className="metric-label">🥇 Gold Members</div><div className="metric-value" style={{ color: '#f59e0b' }}>{goldCount}</div></div>
        <div className="metric"><div className="metric-label">Total Members</div><div className="metric-value">{customers.length}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Loyalty Rules</div>
        <div className="grid-3">
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>💰</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Points Kaise Milte Hain</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>Har ₹100 = <strong>10 points</strong><br />Har visit = <strong>50 bonus points</strong></div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🎁</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Points Kaise Use Karein</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}><strong>100 points = ₹10 discount</strong></div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🏆</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Tiers</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>🥉 0–999 · 🥈 1000+ · 🥇 3000+ · 👑 6000+</div>
          </div>
        </div>
      </div>

      <div className={selected ? 'grid-60-40' : ''}>
        <div>
          <div className="filter-bar">
            <input className="input" placeholder="Customer search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
            <select className="select" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
              <option value="all">Sab Tiers</option>
              <option value="Diamond">👑 Diamond</option><option value="Gold">🥇 Gold</option><option value="Silver">🥈 Silver</option><option value="Bronze">🥉 Bronze</option>
            </select>
          </div>
          {customers.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-icon">🏆</div><div>Koi customer nahi — Customers page pe add karo!</div></div></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Customer</th><th>Tier</th><th>Points</th><th>Discount</th><th>Visits</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map(c => {
                      const tier = getTier(c.loyalty_points || 0)
                      return (
                        <tr key={c.id} style={{ cursor: 'pointer', background: selected?.id === c.id ? '#fdf6fb' : '' }} onClick={() => setSelected(c)}>
                          <td>
                            <div className="flex-gap">
                              <div className="avatar">{c.name?.split(' ').map(w => w[0]).join('')}</div>
                              <div><div className="fw-600">{c.name}</div><div className="text-muted">{c.phone}</div></div>
                            </div>
                          </td>
                          <td><span style={{ background: tier.bg, color: tier.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{tier.icon} {tier.name}</span></td>
                          <td className="mono fw-600" style={{ color: 'var(--pink)' }}>{(c.loyalty_points || 0).toLocaleString('en-IN')}</td>
                          <td className="mono text-success">₹{pointsToDiscount(c.loyalty_points || 0).toLocaleString('en-IN')}</td>
                          <td>{c.total_visits || 0}</td>
                          <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); setSelected(c) }}>Details</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selected && (() => {
          const tier = getTier(selected.loyalty_points || 0)
          const progress = tier.nextAt ? Math.min(((selected.loyalty_points || 0) / tier.nextAt) * 100, 100) : 100
          return (
            <div className="card" style={{ height: 'fit-content' }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="flex-gap">
                  <div className="avatar avatar-lg">{selected.name?.split(' ').map(w => w[0]).join('')}</div>
                  <div><div className="fw-600" style={{ fontSize: 15 }}>{selected.name}</div><div className="text-muted">{selected.phone}</div></div>
                </div>
                <button className="btn btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ background: tier.bg, borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>{tier.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: tier.color }}>{tier.name} Member</div>
                <div style={{ fontWeight: 700, fontSize: 28, color: 'var(--pink)', margin: '6px 0' }}>{(selected.loyalty_points || 0).toLocaleString('en-IN')} pts</div>
                <div className="text-muted" style={{ fontSize: 12 }}>= ₹{pointsToDiscount(selected.loyalty_points || 0)} discount available</div>
                {tier.nextAt && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: tier.color, marginBottom: 4 }}>{tier.nextAt - (selected.loyalty_points || 0)} points aur chahiye {tier.next} ke liye</div>
                    <div style={{ height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}><div style={{ height: 6, width: `${progress}%`, background: tier.color, borderRadius: 3 }} /></div>
                  </div>
                )}
              </div>
              <div className="stats-row" style={{ marginBottom: 14 }}>
                <div className="stat-box"><div className="stat-val">{selected.total_visits || 0}</div><div className="stat-label">Visits</div></div>
                <div className="stat-box"><div className="stat-val">₹{Math.round((selected.total_spent || 0) / 1000)}K</div><div className="stat-label">Spent</div></div>
                <div className="stat-box"><div className="stat-val">₹{pointsToDiscount(selected.loyalty_points || 0)}</div><div className="stat-label">Discount</div></div>
              </div>
              <div className="flex-gap">
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setAddForm(p => ({ ...p, customerId: selected.id })); setAddModal(true) }}>+ Points Add</button>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { setRedeemForm(p => ({ ...p, customerId: selected.id })); setRedeemModal(true) }}>🎁 Redeem</button>
              </div>
            </div>
          )
        })()}
      </div>

      {addModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><div className="modal-title">Points Add Karo</div><button className="modal-close" onClick={() => setAddModal(false)}>✕</button></div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Customer *</label>
                <select className="select" value={addForm.customerId} onChange={e => setAddForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.loyalty_points || 0} pts</option>)}
                </select>
              </div>
              <div className="form-group full"><label className="label">Service Amount (₹) *</label><input type="number" className="input" value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))} /></div>
              <div className="form-group full">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={addForm.visitBonus} onChange={e => setAddForm(p => ({ ...p, visitBonus: e.target.checked }))} /> Visit bonus (+50 points)
                </label>
              </div>
            </div>
            {addForm.amount && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, margin: '12px 0', fontSize: 13 }}>
                <div className="flex-between" style={{ color: 'var(--pink)', fontWeight: 700 }}>
                  <span>Total Points Milenge</span>
                  <span>+{Math.floor(Number(addForm.amount) / 100) * 10 + (addForm.visitBonus ? 50 : 0)} pts</span>
                </div>
              </div>
            )}
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={addPoints} disabled={saving}>{saving ? 'Saving...' : 'Points Add Karo'}</button>
              <button className="btn" onClick={() => setAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {redeemModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRedeemModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><div className="modal-title">Points Redeem Karo</div><button className="modal-close" onClick={() => setRedeemModal(false)}>✕</button></div>
            <div className="form-grid">
              <div className="form-group full"><label className="label">Customer *</label>
                <select className="select" value={redeemForm.customerId} onChange={e => setRedeemForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.loyalty_points || 0} pts</option>)}
                </select>
              </div>
              <div className="form-group full"><label className="label">Kitne Points (100 ke multiple) *</label><input type="number" className="input" step="100" min="100" value={redeemForm.points} onChange={e => setRedeemForm(p => ({ ...p, points: e.target.value }))} /></div>
            </div>
            {redeemForm.points && redeemForm.customerId && (
              <div style={{ background: '#dcfce7', borderRadius: 10, padding: 14, margin: '12px 0', fontSize: 13 }}>
                <div className="flex-between" style={{ fontWeight: 700, color: '#166534' }}><span>Discount milega</span><span>₹{pointsToDiscount(Number(redeemForm.points))}</span></div>
              </div>
            )}
            <div className="gap-btn">
              <button className="btn btn-success" onClick={redeemPoints} disabled={saving}>{saving ? 'Saving...' : 'Redeem Karo'}</button>
              <button className="btn" onClick={() => setRedeemModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
