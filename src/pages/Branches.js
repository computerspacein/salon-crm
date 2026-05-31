import React, { useState } from 'react'
const INIT = [
  { id: 1, name: 'Sector 17, Chandigarh', address: 'SCO 142, Sector 17-C, Chandigarh', phone: '0172-456-7890', staff: 5, clients: 312, revenue: 280000, status: 'active' },
  { id: 2, name: 'Sector 35, Chandigarh', address: 'SCO 88, Sector 35-B, Chandigarh', phone: '0172-567-8901', staff: 4, clients: 241, revenue: 210000, status: 'active' },
  { id: 3, name: 'Phase 7, Mohali', address: 'Phase 7 Market, SAS Nagar, Mohali', phone: '0172-678-9012', staff: 4, clients: 278, revenue: 240000, status: 'active' },
  { id: 4, name: 'Panchkula, Sec 9', address: 'SCO 22, Sector 9, Panchkula', phone: '0172-789-0123', staff: 3, clients: 198, revenue: 190000, status: 'growing' },
]
const STATUS_BADGE = { active: <span className="badge badge-success">Active</span>, growing: <span className="badge badge-warning">Growing</span>, inactive: <span className="badge badge-danger">Inactive</span> }

export default function Branches() {
  const [branches] = useState(INIT)
  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Branch Settings</div><div className="page-sub">{branches.length} branches</div></div>
        <button className="btn btn-primary">+ Add Branch</button>
      </div>
      <div className="grid-2">
        {branches.map(b => (
          <div className="card" key={b.id}>
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div className="fw-600" style={{ fontSize: 15 }}>{b.name}</div>
              {STATUS_BADGE[b.status]}
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>📍 {b.address}</div>
            <div className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>📞 {b.phone}</div>
            <div className="divider" />
            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{b.staff}</div><div className="stat-label">Staff</div></div>
              <div className="stat-box"><div className="stat-val">{b.clients}</div><div className="stat-label">Clients/mo</div></div>
              <div className="stat-box"><div className="stat-val">₹{Math.round(b.revenue / 1000)}K</div><div className="stat-label">Revenue</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
