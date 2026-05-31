import React, { useState } from 'react'

const INIT_CUSTOMERS = [
  { id: 1, name: 'Priya Sharma', phone: '98765-43210', branch: 'Sector 17', points: 4250, totalVisits: 28, totalSpent: 42500, lastVisit: '2026-05-31' },
  { id: 2, name: 'Neelam Kapoor', phone: '65432-10987', branch: 'Sector 17', points: 7830, totalVisits: 42, totalSpent: 78300, lastVisit: '2026-05-24' },
  { id: 3, name: 'Meena Gupta', phone: '87654-32109', branch: 'Sector 35', points: 1820, totalVisits: 15, totalSpent: 18200, lastVisit: '2026-05-31' },
  { id: 4, name: 'Renu Bhatia', phone: '76543-21098', branch: 'Mohali', points: 875, totalVisits: 7, totalSpent: 8750, lastVisit: '2026-05-29' },
  { id: 5, name: 'Kavita Singh', phone: '43210-98765', branch: 'Panchkula', points: 1120, totalVisits: 9, totalSpent: 11200, lastVisit: '2026-05-31' },
  { id: 6, name: 'Sunita Arora', phone: '54321-09876', branch: 'Panchkula', points: 285, totalVisits: 3, totalSpent: 2850, lastVisit: '2026-05-17' },
]

const INIT_HISTORY = [
  { id: 1, customerId: 1, date: '2026-05-31', type: 'earned', points: 230, desc: 'Hair Color + Cut — ₹1,800 + visit bonus' },
  { id: 2, customerId: 2, date: '2026-05-24', type: 'earned', points: 530, desc: 'Keratin, Olaplex — ₹4,800 + visit bonus' },
  { id: 3, customerId: 3, date: '2026-05-31', type: 'earned', points: 145, desc: 'Facial + Waxing — ₹950 + visit bonus' },
  { id: 4, customerId: 1, date: '2026-05-15', type: 'redeemed', points: -500, desc: 'Discount redeemed — ₹50 off' },
]

const getTier = (points) => {
  if (points >= 6000) return { name: 'Diamond', icon: '👑', color: '#6366f1', bg: '#eef2ff', next: null, nextAt: null }
  if (points >= 3000) return { name: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#fef3c7', next: 'Diamond', nextAt: 6000 }
  if (points >= 1000) return { name: 'Silver', icon: '🥈', color: '#6b7280', bg: '#f3f4f6', next: 'Gold', nextAt: 3000 }
  return { name: 'Bronze', icon: '🥉', color: '#92400e', bg: '#fef3c7', next: 'Silver', nextAt: 1000 }
}

const pointsToDiscount = (points) => Math.floor(points / 100) * 10

export default function Loyalty() {
  const [customers, setCustomers] = useState(INIT_CUSTOMERS)
  const [history, setHistory] = useState(INIT_HISTORY)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [redeemModal, setRedeemModal] = useState(false)
  const [addForm, setAddForm] = useState({ customerId: '', amount: '', visitBonus: true })
  const [redeemForm, setRedeemForm] = useState({ customerId: '', points: '' })
  const [tierFilter, setTierFilter] = useState('all')

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    if (tierFilter === 'all') return matchSearch
    return matchSearch && getTier(c.points).name === tierFilter
  })

  // Add Points
  const addPoints = () => {
    const cust = customers.find(c => c.id === Number(addForm.customerId))
    if (!cust || !addForm.amount) return
    const earned = Math.floor(Number(addForm.amount) / 100) * 10
    const visitBonus = addForm.visitBonus ? 50 : 0
    const total = earned + visitBonus

    setCustomers(p => p.map(c => c.id === cust.id ? {
      ...c,
      points: c.points + total,
      totalVisits: addForm.visitBonus ? c.totalVisits + 1 : c.totalVisits,
      totalSpent: c.totalSpent + Number(addForm.amount),
      lastVisit: new Date().toISOString().slice(0, 10)
    } : c))

    setHistory(p => [{ id: Date.now(), customerId: cust.id, date: new Date().toISOString().slice(0, 10), type: 'earned', points: total, desc: `₹${Number(addForm.amount).toLocaleString('en-IN')} service${addForm.visitBonus ? ' + visit bonus' : ''}` }, ...p])

    if (selected?.id === cust.id) setSelected(prev => ({ ...prev, points: prev.points + total }))
    setAddModal(false)
    setAddForm({ customerId: '', amount: '', visitBonus: true })
  }

  // Redeem Points
  const redeemPoints = () => {
    const cust = customers.find(c => c.id === Number(redeemForm.customerId))
    if (!cust || !redeemForm.points) return
    const pts = Number(redeemForm.points)
    if (pts > cust.points) return alert('Itne points nahi hain!')
    if (pts % 100 !== 0) return alert('Points 100 ke multiple mein hone chahiye!')

    const discount = pointsToDiscount(pts)
    setCustomers(p => p.map(c => c.id === cust.id ? { ...c, points: c.points - pts } : c))
    setHistory(p => [{ id: Date.now(), customerId: cust.id, date: new Date().toISOString().slice(0, 10), type: 'redeemed', points: -pts, desc: `${pts} points redeem — ₹${discount} discount mila` }, ...p])

    if (selected?.id === cust.id) setSelected(prev => ({ ...prev, points: prev.points - pts }))
    setRedeemModal(false)
    setRedeemForm({ customerId: '', points: '' })
  }

  const custHistory = selected ? history.filter(h => h.customerId === selected.id) : []

  const totalPointsIssued = customers.reduce((s, c) => s + c.points, 0)
  const diamondCount = customers.filter(c => getTier(c.points).name === 'Diamond').length
  const goldCount = customers.filter(c => getTier(c.points).name === 'Gold').length

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Loyalty Program</div><div className="page-sub">Points earn karo, discount pao</div></div>
        <div className="flex-gap">
          <button className="btn" onClick={() => setRedeemModal(true)}>🎁 Points Redeem Karo</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Points Add Karo</button>
        </div>
      </div>

      {/* Summary */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="metric"><div className="metric-label">Total Points Issued</div><div className="metric-value">{totalPointsIssued.toLocaleString('en-IN')}</div></div>
        <div className="metric"><div className="metric-label">👑 Diamond Members</div><div className="metric-value" style={{ color: '#6366f1' }}>{diamondCount}</div></div>
        <div className="metric"><div className="metric-label">🥇 Gold Members</div><div className="metric-value" style={{ color: '#f59e0b' }}>{goldCount}</div></div>
        <div className="metric"><div className="metric-label">Total Members</div><div className="metric-value">{customers.length}</div></div>
      </div>

      {/* Rules Card */}
      <div className="card mb-24" style={{ marginBottom: 16 }}>
        <div className="card-title">Loyalty Rules</div>
        <div className="grid-3">
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>💰</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Points Kaise Milte Hain</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>Har ₹100 kharch = <strong>10 points</strong><br />Har visit = <strong>50 bonus points</strong></div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🎁</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Points Kaise Use Karein</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}><strong>100 points = ₹10 discount</strong><br />Invoice mein redeem karo</div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🏆</div>
            <div className="fw-600" style={{ fontSize: 13 }}>Tiers</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
              🥉 Bronze: 0–999 pts<br />
              🥈 Silver: 1000–2999 pts<br />
              🥇 Gold: 3000–5999 pts<br />
              👑 Diamond: 6000+ pts
            </div>
          </div>
        </div>
      </div>

      <div className={selected ? 'grid-60-40' : ''}>
        {/* Customer List */}
        <div>
          <div className="filter-bar">
            <input className="input" placeholder="Customer search karo..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
            <select className="select" value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
              <option value="all">Sab Tiers</option>
              <option value="Diamond">👑 Diamond</option>
              <option value="Gold">🥇 Gold</option>
              <option value="Silver">🥈 Silver</option>
              <option value="Bronze">🥉 Bronze</option>
            </select>
          </div>
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Customer</th><th>Tier</th><th>Points</th><th>Discount Value</th><th>Visits</th><th>Last Visit</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const tier = getTier(c.points)
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer', background: selected?.id === c.id ? '#fdf6fb' : '' }} onClick={() => setSelected(c)}>
                        <td>
                          <div className="flex-gap">
                            <div className="avatar">{c.name.split(' ').map(w => w[0]).join('')}</div>
                            <div><div className="fw-600">{c.name}</div><div className="text-muted">{c.phone}</div></div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: tier.bg, color: tier.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {tier.icon} {tier.name}
                          </span>
                        </td>
                        <td className="mono fw-600" style={{ color: 'var(--pink)' }}>{c.points.toLocaleString('en-IN')}</td>
                        <td className="mono text-success">₹{pointsToDiscount(c.points).toLocaleString('en-IN')}</td>
                        <td>{c.totalVisits}</td>
                        <td className="text-muted">{c.lastVisit}</td>
                        <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); setSelected(c) }}>Details</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (() => {
          const tier = getTier(selected.points)
          const progress = tier.nextAt ? Math.min((selected.points / tier.nextAt) * 100, 100) : 100
          const cHistory = history.filter(h => h.customerId === selected.id)
          return (
            <div className="card" style={{ height: 'fit-content' }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="flex-gap">
                  <div className="avatar avatar-lg">{selected.name.split(' ').map(w => w[0]).join('')}</div>
                  <div>
                    <div className="fw-600" style={{ fontSize: 15 }}>{selected.name}</div>
                    <div className="text-muted">{selected.phone}</div>
                  </div>
                </div>
                <button className="btn btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div style={{ background: tier.bg, borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>{tier.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: tier.color }}>{tier.name} Member</div>
                <div style={{ fontWeight: 700, fontSize: 28, color: 'var(--pink)', margin: '6px 0' }}>{selected.points.toLocaleString('en-IN')} pts</div>
                <div className="text-muted" style={{ fontSize: 12 }}>= ₹{pointsToDiscount(selected.points)} discount available</div>
                {tier.nextAt && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 11, color: tier.color, marginBottom: 4 }}>{tier.nextAt - selected.points} points aur chahiye {tier.next} ke liye</div>
                    <div style={{ height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 3 }}>
                      <div style={{ height: 6, width: `${progress}%`, background: tier.color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="stats-row" style={{ marginBottom: 14 }}>
                <div className="stat-box"><div className="stat-val">{selected.totalVisits}</div><div className="stat-label">Visits</div></div>
                <div className="stat-box"><div className="stat-val">₹{Math.round(selected.totalSpent / 1000)}K</div><div className="stat-label">Total Spent</div></div>
                <div className="stat-box"><div className="stat-val">₹{pointsToDiscount(selected.points)}</div><div className="stat-label">Discount</div></div>
              </div>

              <div className="flex-gap" style={{ marginBottom: 14 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { setAddForm(p => ({ ...p, customerId: selected.id })); setAddModal(true) }}>+ Points Add</button>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { setRedeemForm(p => ({ ...p, customerId: selected.id })); setRedeemModal(true) }}>🎁 Redeem</button>
              </div>

              <div className="card-title" style={{ fontSize: 12, marginBottom: 8 }}>POINTS HISTORY</div>
              {cHistory.length === 0 ? <div className="text-muted" style={{ fontSize: 12 }}>Koi history nahi</div> :
                cHistory.slice(0, 6).map(h => (
                  <div key={h.id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{h.desc}</div>
                      <div className="text-muted">{h.date}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: h.type === 'earned' ? 'var(--success)' : 'var(--danger)', fontFamily: 'monospace' }}>
                      {h.type === 'earned' ? '+' : ''}{h.points} pts
                    </div>
                  </div>
                ))
              }
            </div>
          )
        })()}
      </div>

      {/* Add Points Modal */}
      {addModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Points Add Karo</div>
              <button className="modal-close" onClick={() => setAddModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="label">Customer Select Karo *</label>
                <select className="select" value={addForm.customerId} onChange={e => setAddForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.points} pts</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="label">Service Amount (₹) *</label>
                <input type="number" className="input" placeholder="jaise: 1800" value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={addForm.visitBonus} onChange={e => setAddForm(p => ({ ...p, visitBonus: e.target.checked }))} />
                  Visit bonus add karo (+50 points)
                </label>
              </div>
            </div>

            {addForm.amount && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, margin: '12px 0', fontSize: 13 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span className="text-muted">Service points (₹{addForm.amount} / 100 × 10)</span>
                  <span className="fw-600">+{Math.floor(Number(addForm.amount) / 100) * 10} pts</span>
                </div>
                {addForm.visitBonus && <div className="flex-between" style={{ marginBottom: 6 }}>
                  <span className="text-muted">Visit bonus</span><span className="fw-600">+50 pts</span>
                </div>}
                <div className="divider" />
                <div className="flex-between" style={{ color: 'var(--pink)', fontWeight: 700 }}>
                  <span>Total Points Milenge</span>
                  <span>+{Math.floor(Number(addForm.amount) / 100) * 10 + (addForm.visitBonus ? 50 : 0)} pts</span>
                </div>
              </div>
            )}

            <div className="gap-btn">
              <button className="btn btn-primary" onClick={addPoints}>Points Add Karo</button>
              <button className="btn" onClick={() => setAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRedeemModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Points Redeem Karo</div>
              <button className="modal-close" onClick={() => setRedeemModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="label">Customer Select Karo *</label>
                <select className="select" value={redeemForm.customerId} onChange={e => setRedeemForm(p => ({ ...p, customerId: e.target.value }))}>
                  <option value="">-- Customer chuno --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.points} pts available</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="label">Kitne Points Redeem Karne Hain (100 ke multiple mein) *</label>
                <input type="number" className="input" placeholder="jaise: 500" step="100" min="100" value={redeemForm.points} onChange={e => setRedeemForm(p => ({ ...p, points: e.target.value }))} />
              </div>
            </div>

            {redeemForm.points && redeemForm.customerId && (
              <div style={{ background: '#dcfce7', borderRadius: 10, padding: 14, margin: '12px 0', fontSize: 13 }}>
                <div className="flex-between" style={{ fontWeight: 700, color: '#166534' }}>
                  <span>Customer ko discount milega</span>
                  <span>₹{pointsToDiscount(Number(redeemForm.points))}</span>
                </div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                  {redeemForm.points} points deduct honge
                </div>
              </div>
            )}

            <div className="gap-btn">
              <button className="btn btn-success" onClick={redeemPoints}>Redeem Karo</button>
              <button className="btn" onClick={() => setRedeemModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
