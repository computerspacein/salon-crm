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
