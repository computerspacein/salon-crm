import React, { useState } from 'react'

const INIT = [
  { id: 1, name: 'Priya Sharma', phone: '98765-43210', email: 'priya@gmail.com', branch: 'Sector 17', visits: 28, spent: 42500, lastVisit: '2026-05-31', loyalty: 5, notes: 'Prefers Ritu for hair' },
  { id: 2, name: 'Meena Gupta', phone: '87654-32109', email: 'meena.g@yahoo.com', branch: 'Sector 35', visits: 15, spent: 18200, lastVisit: '2026-05-31', loyalty: 4, notes: '' },
  { id: 3, name: 'Renu Bhatia', phone: '76543-21098', email: '', branch: 'Mohali', visits: 7, spent: 8750, lastVisit: '2026-05-29', loyalty: 3, notes: '' },
  { id: 4, name: 'Neelam Kapoor', phone: '65432-10987', email: 'neelam@gmail.com', branch: 'Sector 17', visits: 42, spent: 78300, lastVisit: '2026-05-24', loyalty: 5, notes: 'VIP — Birthday June 12' },
  { id: 5, name: 'Sunita Arora', phone: '54321-09876', email: 's.arora@outlook.com', branch: 'Panchkula', visits: 3, spent: 2850, lastVisit: '2026-05-17', loyalty: 2, notes: '' },
  { id: 6, name: 'Kavita Singh', phone: '43210-98765', email: '', branch: 'Panchkula', visits: 9, spent: 11200, lastVisit: '2026-05-31', loyalty: 3, notes: '' },
]

const BLANK = { name: '', phone: '', email: '', branch: 'Sector 17', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState(INIT)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [selected, setSelected] = useState(null)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const save = () => {
    if (!form.name || !form.phone) return
    setCustomers(p => [{ ...form, id: Date.now(), visits: 0, spent: 0, lastVisit: '—', loyalty: 1 }, ...p])
    setModal(false)
    setForm(BLANK)
  }

  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-sub">{filtered.length} customers</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Customer</button>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Naam ya phone se search karo..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Customer</th><th>Phone</th><th>Visits</th><th>Total Spent</th><th>Last Visit</th><th>Preferred Branch</th><th>Loyalty</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                  <td>
                    <div className="flex-gap">
                      <div className="avatar">{c.name.split(' ').map(w => w[0]).join('')}</div>
                      <div>
                        <div className="fw-600">{c.name}</div>
                        <div className="text-muted">{c.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td className="mono">{c.visits}</td>
                  <td className="mono fw-600">₹{c.spent.toLocaleString('en-IN')}</td>
                  <td className="text-muted">{c.lastVisit}</td>
                  <td>{c.branch}</td>
                  <td style={{ color: '#f59e0b', fontSize: 14 }}>{stars(c.loyalty)}</td>
                  <td><button className="btn btn-sm" onClick={e => { e.stopPropagation(); setSelected(c) }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Naya Customer Add Karo</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="label">Naam *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Phone *</label><input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Email</label><input className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="form-group"><label className="label">Preferred Branch</label><select className="select" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}><option>Sector 17</option><option>Sector 35</option><option>Mohali</option><option>Panchkula</option></select></div>
              <div className="form-group full"><label className="label">Notes</label><textarea className="textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="gap-btn">
              <button className="btn btn-primary" onClick={save}>Save Customer</button>
              <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="flex-gap">
                <div className="avatar avatar-lg">{selected.name.split(' ').map(w => w[0]).join('')}</div>
                <div>
                  <div className="modal-title">{selected.name}</div>
                  <div className="text-muted">{selected.branch}</div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{selected.visits}</div><div className="stat-label">Total Visits</div></div>
              <div className="stat-box"><div className="stat-val">₹{(selected.spent / 1000).toFixed(0)}K</div><div className="stat-label">Total Spent</div></div>
              <div className="stat-box"><div className="stat-val" style={{ color: '#f59e0b' }}>{'★'.repeat(selected.loyalty)}</div><div className="stat-label">Loyalty</div></div>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 13 }}>
              <div className="flex-gap" style={{ marginBottom: 8 }}><span className="text-muted" style={{ width: 100 }}>Phone:</span><span>{selected.phone}</span></div>
              <div className="flex-gap" style={{ marginBottom: 8 }}><span className="text-muted" style={{ width: 100 }}>Email:</span><span>{selected.email || '—'}</span></div>
              <div className="flex-gap" style={{ marginBottom: 8 }}><span className="text-muted" style={{ width: 100 }}>Last Visit:</span><span>{selected.lastVisit}</span></div>
              {selected.notes && <div className="flex-gap"><span className="text-muted" style={{ width: 100 }}>Notes:</span><span>{selected.notes}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
