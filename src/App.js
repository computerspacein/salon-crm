import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
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
import QuickBilling from './pages/QuickBilling'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Users from './pages/Users'
import { getBranches } from './lib/supabase'
import './App.css'

// adminOnly: true means only admin can see/access
const NAV = [
  { section: 'Main' },
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/quick-billing', label: 'Quick Billing', icon: '💵' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/loyalty', label: 'Loyalty Program', icon: '🏆' },
  { path: '/staff', label: 'Staff', icon: '👤', adminOnly: true },
  { section: 'Finance', adminOnly: true },
  { path: '/accounting', label: 'Accounting', icon: '📊', adminOnly: true },
  { path: '/invoices', label: 'Invoices', icon: '🧾', adminOnly: true },
  { path: '/expenses', label: 'Expenses', icon: '📉', adminOnly: true },
  { path: '/reports', label: 'Service Reports', icon: '📈', adminOnly: true },
  { section: 'Settings' },
  { path: '/services', label: 'Services & Pricing', icon: '✂️' },
  { path: '/branches', label: 'Branch Settings', icon: '🏪', adminOnly: true },
  { path: '/users', label: 'User Management', icon: '🔑', adminOnly: true },
]

function Sidebar({ branch, setBranch, branches, user, onLogout }) {
  const isAdmin = user.role === 'admin'
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">✂</div>
        <div>
          <div className="logo-name">Scissors Masterz</div>
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
        {NAV.map((item, i) => {
          if (item.adminOnly && !isAdmin) return null
          return item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}><div className="user-name">{user.name}</div><div className="user-role">{user.role === 'admin' ? 'Owner / Admin' : 'Staff'}</div></div>
        </div>
        <button className="btn btn-sm" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }} onClick={onLogout}>Logout</button>
      </div>
    </aside>
  )
}

// Guard: admin-only routes redirect staff to dashboard
function AdminRoute({ user, children }) {
  return user.role === 'admin' ? children : <Navigate to="/" replace />
}

function AppInner({ user, onLogout }) {
  const [branch, setBranch] = useState('all')
  const [branches, setBranches] = useState([])

  useEffect(() => {
    getBranches().then(({ data }) => setBranches(data || []))
  }, [])

  const ctx = { branch, setBranch, branches, currentUser: user }
  return (
    <div className="app-shell">
      <Sidebar {...ctx} user={user} onLogout={onLogout} />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard {...ctx} />} />
          <Route path="/quick-billing" element={<QuickBilling {...ctx} />} />
          <Route path="/appointments" element={<Appointments {...ctx} />} />
          <Route path="/customers" element={<Customers {...ctx} />} />
          <Route path="/loyalty" element={<Loyalty {...ctx} />} />
          <Route path="/services" element={<Services {...ctx} />} />
          <Route path="/staff" element={<AdminRoute user={user}><Staff {...ctx} /></AdminRoute>} />
          <Route path="/accounting" element={<AdminRoute user={user}><Accounting {...ctx} /></AdminRoute>} />
          <Route path="/invoices" element={<AdminRoute user={user}><Invoices {...ctx} /></AdminRoute>} />
          <Route path="/expenses" element={<AdminRoute user={user}><Expenses {...ctx} /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute user={user}><Reports {...ctx} /></AdminRoute>} />
          <Route path="/branches" element={<AdminRoute user={user}><Branches {...ctx} /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute user={user}><Users {...ctx} /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sm_user')) } catch { return null }
  })

  const logout = () => { localStorage.removeItem('sm_user'); setUser(null) }

  if (!user) return <Login onLogin={setUser} />

  return <BrowserRouter><AppInner user={user} onLogout={logout} /></BrowserRouter>
}
