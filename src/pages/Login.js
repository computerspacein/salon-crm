import React, { useState } from 'react'
import { loginUser } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!username || !password) return
    setLoading(true); setError('')
    const { data } = await loginUser(username, password)
    if (data) {
      const user = { id: data.id, username: data.username, name: data.name, role: data.role }
      localStorage.setItem('sm_user', JSON.stringify(user))
      onLogin(user)
    } else {
      setError('Galat username ya password')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sidebar-bg)' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 380, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, background: 'var(--pink)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', margin: '0 auto 12px' }}>✂</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Scissors Masterz</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Salon CRM — Login</div>
        </div>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="label">Username</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="username" autoFocus />
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••" />
        </div>

        {error && <div style={{ background: 'var(--danger-bg)', color: '#991b1b', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submit} disabled={loading}>
          {loading ? 'Login ho raha hai...' : 'Login'}
        </button>
      </div>
    </div>
  )
}
