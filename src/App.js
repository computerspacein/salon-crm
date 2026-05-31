import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Customers from './pages/Customers'
import Staff from './pages/Staff'
import Accounting from './pages/Accounting'
import Invoices from './pages/Invoices'
import Expenses from './pages/Expenses'
import Services from './pages/Services'
import Branches from './pages/Branches'
import Loyalty from './pages/Loyalty'
import './App.css'

const NAV = [
  { section: 'Main' },
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/loyalty', label: 'Loyalty Program', icon: '🏆' },
  { path: '/staff', label: 'Staff', icon: '👤' },
  { section: 'Finance' },
  { path: '/accounting', label: 'Accounting', icon: '📊' },
  { path: '/invoices', label: 'Invoices', icon: '🧾' },
  { path: '/expenses', label: 'Expenses', icon: '📉' },
  { section: 'Settings' },
  { path: '/services', label: 'Services & Pricing', icon: '✂️' },
  { path: '/branches', label: 'Branch Settings', icon: '🏪' },
]

function Sidebar({ branch, setBranch, branches }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">✂</div>
        <div>
          <div className="logo-name">GlamSync</div>
          <div className="logo-sub">Salon CRM</div>
        </div>
      </div>
      <div className="branch-select-wrap">
        <select value={branch} onChange={e => setBranch(e.target.value)} className="branch-select">
          <option value="all">🏢 Sab Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <nav className="nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div><div className="user-name">Admin</div><div className="user-role">Owner</div></div>
        </div>
      </div>
    </aside>
  )
}

function AppInner() {
  const [branch, setBranch] = useState('all')
  const [branches] = useState([
    { id: 'b1', name: 'Sector 17, Chandigarh' },
    { id: 'b2', name: 'Sector 35, Chandigarh' },
    { id: 'b3', name: 'Phase 7, Mohali' },
    { id: 'b4', name: 'Panchkula, Sec 9' },
  ])
  const ctx = { branch, setBranch, branches }
  return (
    <div className="app-shell">
      <Sidebar {...ctx} />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard {...ctx} />} />
          <Route path="/appointments" element={<Appointments {...ctx} />} />
          <Route path="/customers" element={<Customers {...ctx} />} />
          <Route path="/loyalty" element={<Loyalty {...ctx} />} />
          <Route path="/staff" element={<Staff {...ctx} />} />
          <Route path="/accounting" element={<Accounting {...ctx} />} />
          <Route path="/invoices" element={<Invoices {...ctx} />} />
          <Route path="/expenses" element={<Expenses {...ctx} />} />
          <Route path="/services" element={<Services {...ctx} />} />
          <Route path="/branches" element={<Branches {...ctx} />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <BrowserRouter><AppInner /></BrowserRouter>
}
