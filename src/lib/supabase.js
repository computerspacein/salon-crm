import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// =============================================
// BRANCHES
// =============================================
export const getBranches = async () => {
  const { data, error } = await supabase.from('branches').select('*').order('created_at')
  return { data, error }
}
export const addBranch = async (branch) => {
  const { data, error } = await supabase.from('branches').insert([branch]).select()
  return { data, error }
}
export const updateBranch = async (id, updates) => {
  const { data, error } = await supabase.from('branches').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteBranch = async (id) => {
  const { error } = await supabase.from('branches').delete().eq('id', id)
  return { error }
}

// =============================================
// STAFF
// =============================================
export const getStaff = async () => {
  const { data, error } = await supabase.from('staff').select('*, branches(name)').order('created_at')
  return { data, error }
}
export const addStaff = async (staff) => {
  const { data, error } = await supabase.from('staff').insert([staff]).select()
  return { data, error }
}
export const updateStaff = async (id, updates) => {
  const { data, error } = await supabase.from('staff').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteStaff = async (id) => {
  const { error } = await supabase.from('staff').delete().eq('id', id)
  return { error }
}

// =============================================
// CUSTOMERS
// =============================================
export const getCustomers = async () => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  return { data, error }
}
export const addCustomer = async (customer) => {
  const { data, error } = await supabase.from('customers').insert([customer]).select()
  return { data, error }
}
export const updateCustomer = async (id, updates) => {
  const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteCustomer = async (id) => {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  return { error }
}

// =============================================
// SERVICES
// =============================================
export const getServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('category')
  return { data, error }
}
export const addService = async (service) => {
  const { data, error } = await supabase.from('services').insert([service]).select()
  return { data, error }
}
export const updateService = async (id, updates) => {
  const { data, error } = await supabase.from('services').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteService = async (id) => {
  const { error } = await supabase.from('services').delete().eq('id', id)
  return { error }
}

// =============================================
// APPOINTMENTS
// =============================================
export const getAppointments = async (branchId = null) => {
  let query = supabase.from('appointments').select(`
    *, 
    customers(name, phone),
    branches(name),
    staff(name),
    services(name)
  `).order('appointment_date', { ascending: false }).order('appointment_time', { ascending: false })
  if (branchId && branchId !== 'all') query = query.eq('branch_id', branchId)
  const { data, error } = await query
  return { data, error }
}
export const addAppointment = async (appt) => {
  const { data, error } = await supabase.from('appointments').insert([appt]).select()
  return { data, error }
}
export const updateAppointment = async (id, updates) => {
  const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteAppointment = async (id) => {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  return { error }
}

// =============================================
// INVOICES
// =============================================
export const getInvoices = async () => {
  const { data, error } = await supabase.from('invoices').select(`
    *,
    customers(name, phone),
    branches(name)
  `).order('created_at', { ascending: false })
  return { data, error }
}
export const addInvoice = async (invoice) => {
  const { data, error } = await supabase.from('invoices').insert([invoice]).select()
  return { data, error }
}
export const updateInvoice = async (id, updates) => {
  const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteInvoice = async (id) => {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  return { error }
}

// =============================================
// EXPENSES
// =============================================
export const getExpenses = async () => {
  const { data, error } = await supabase.from('expenses').select('*, branches(name)').order('expense_date', { ascending: false })
  return { data, error }
}
export const addExpense = async (expense) => {
  const { data, error } = await supabase.from('expenses').insert([expense]).select()
  return { data, error }
}
export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select()
  return { data, error }
}
export const deleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  return { error }
}

// =============================================
// LEDGER
// =============================================
export const getLedger = async () => {
  const { data, error } = await supabase.from('ledger').select('*, branches(name)').order('entry_date', { ascending: false })
  return { data, error }
}
export const addLedgerEntry = async (entry) => {
  const { data, error } = await supabase.from('ledger').insert([entry]).select()
  return { data, error }
}

// =============================================
// DASHBOARD STATS
// =============================================
export const getDashboardStats = async () => {
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)

  const [appts, customers, invoicesToday, invoicesMonth, expensesMonth] = await Promise.all([
    supabase.from('appointments').select('id, final_amount, status').eq('appointment_date', today),
    supabase.from('customers').select('id', { count: 'exact' }),
    supabase.from('invoices').select('total').eq('invoice_date', today).eq('status', 'paid'),
    supabase.from('invoices').select('total').gte('invoice_date', thisMonth + '-01').eq('status', 'paid'),
    supabase.from('expenses').select('amount').gte('expense_date', thisMonth + '-01'),
  ])

  const todayRevenue = (invoicesToday.data || []).reduce((s, i) => s + Number(i.total), 0)
  const monthRevenue = (invoicesMonth.data || []).reduce((s, i) => s + Number(i.total), 0)
  const monthExpenses = (expensesMonth.data || []).reduce((s, e) => s + Number(e.amount), 0)
  const todayAppts = (appts.data || []).length

  return {
    todayRevenue,
    monthRevenue,
    monthExpenses,
    netProfit: monthRevenue - monthExpenses,
    todayAppts,
    totalCustomers: customers.count || 0,
  }
}

// =============================================
// FULL DASHBOARD DATA (branch-aware)
// =============================================
export const getDashboardData = async (branchId = 'all') => {
  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = today.slice(0, 7)
  const monthStart = thisMonth + '-01'

  let invQ = supabase.from('invoices').select('*, branches(name)').gte('invoice_date', monthStart)
  let apptQ = supabase.from('appointments').select('*, customers(name, phone), staff(name), services(name), branches(name)').eq('appointment_date', today)
  let custQ = supabase.from('customers').select('id', { count: 'exact', head: true })
  let expQ = supabase.from('expenses').select('amount').gte('expense_date', monthStart)
  let branchQ = supabase.from('branches').select('*')
  let monthApptQ = supabase.from('appointments').select('final_amount, services(name), branch_id').gte('appointment_date', monthStart)

  if (branchId && branchId !== 'all') {
    invQ = invQ.eq('branch_id', branchId)
    apptQ = apptQ.eq('branch_id', branchId)
    expQ = expQ.eq('branch_id', branchId)
    monthApptQ = monthApptQ.eq('branch_id', branchId)
  }

  const [inv, appt, cust, exp, branchesRes, monthAppt] = await Promise.all([invQ, apptQ, custQ, expQ, branchQ, monthApptQ])

  const invoices = inv.data || []
  const todayAppts = appt.data || []
  const branches = branchesRes.data || []
  const monthAppts = monthAppt.data || []

  const todayRevenue = invoices.filter(i => i.invoice_date === today && i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const monthRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const monthExpenses = (exp.data || []).reduce((s, e) => s + Number(e.amount), 0)

  // Branch-wise revenue (this month, paid invoices)
  const branchWise = branches.map(b => ({
    name: b.name,
    revenue: invoices.filter(i => i.branch_id === b.id && i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  }))

  // Top services (this month, by appointment final_amount)
  const svcMap = {}
  monthAppts.forEach(a => {
    const name = a.services?.name || 'Other'
    svcMap[name] = (svcMap[name] || 0) + Number(a.final_amount || 0)
  })
  const topServices = Object.entries(svcMap).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return {
    todayRevenue,
    monthRevenue,
    monthExpenses,
    netProfit: monthRevenue - monthExpenses,
    todayApptsCount: todayAppts.length,
    todayApptsList: todayAppts,
    totalCustomers: cust.count || 0,
    branchWise,
    topServices,
  }
}

// =============================================
// BILL ITEMS (for auto-popular services)
// =============================================
export const addBillItems = async (items) => {
  const { data, error } = await supabase.from('bill_items').insert(items).select()
  return { data, error }
}

// Top services by bill count (auto-popular)
export const getTopBilledServices = async (limit = 8) => {
  const { data, error } = await supabase.from('bill_items').select('service_id, service_name')
  if (error || !data) return { data: [], error }
  // Count occurrences
  const counts = {}
  data.forEach(row => {
    const key = row.service_id || row.service_name
    if (!counts[key]) counts[key] = { service_id: row.service_id, service_name: row.service_name, count: 0 }
    counts[key].count++
  })
  const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, limit)
  return { data: sorted, error: null }
}

// =============================================
// SERVICE REPORTS (from bill_items)
// =============================================
export const getBillItemsReport = async (fromDate = null, toDate = null) => {
  let q = supabase.from('bill_items').select('*, branches(name)')
  if (fromDate) q = q.gte('created_at', fromDate)
  if (toDate) q = q.lte('created_at', toDate + 'T23:59:59')
  const { data, error } = await q
  return { data: data || [], error }
}

// =============================================
// AUTH / APP USERS
// =============================================
export const sha256 = async (text) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const loginUser = async (username, password) => {
  const hash = await sha256(password)
  const { data, error } = await supabase.from('app_users')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .eq('password_hash', hash)
    .eq('is_active', true)
    .maybeSingle()
  return { data, error }
}

export const getUsers = async () => {
  const { data, error } = await supabase.from('app_users').select('id, username, name, role, is_active, created_at').order('created_at')
  return { data, error }
}

export const addUser = async ({ username, password, name, role }) => {
  const password_hash = await sha256(password)
  const { data, error } = await supabase.from('app_users')
    .insert([{ username: username.trim().toLowerCase(), password_hash, name, role }]).select()
  return { data, error }
}

export const updateUserAccount = async (id, updates) => {
  if (updates.password) {
    updates.password_hash = await sha256(updates.password)
    delete updates.password
  }
  const { data, error } = await supabase.from('app_users').update(updates).eq('id', id).select()
  return { data, error }
}

export const deleteUserAccount = async (id) => {
  const { error } = await supabase.from('app_users').delete().eq('id', id)
  return { error }
}
