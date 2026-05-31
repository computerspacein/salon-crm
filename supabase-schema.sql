-- =============================================
-- GLAMSYNC SALON CRM - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Branches (Salon locations)
CREATE TABLE branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Chandigarh',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff
CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  branch_id UUID REFERENCES branches(id),
  salary NUMERIC DEFAULT 0,
  commission_pct NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services & Pricing
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  duration_min INTEGER DEFAULT 60,
  price_min NUMERIC NOT NULL,
  price_max NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  preferred_branch_id UUID REFERENCES branches(id),
  loyalty_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  branch_id UUID REFERENCES branches(id),
  staff_id UUID REFERENCES staff(id),
  service_id UUID REFERENCES services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_min INTEGER DEFAULT 60,
  amount NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'Cash',
  status TEXT DEFAULT 'upcoming', -- upcoming, in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  branch_id UUID REFERENCES branches(id),
  appointment_id UUID REFERENCES appointments(id),
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  gst_pct NUMERIC DEFAULT 18,
  gst_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'Cash',
  status TEXT DEFAULT 'paid', -- paid, pending, cancelled
  invoice_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id),
  category TEXT NOT NULL, -- Rent, Payroll, Inventory, Utilities, Marketing, Other
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_mode TEXT DEFAULT 'Cash',
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ledger (Auto-populated via triggers for full accounting)
CREATE TABLE ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID REFERENCES branches(id),
  entry_date DATE DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  category TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  reference_id UUID,
  reference_type TEXT, -- invoice, expense, appointment
  payment_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SEED DATA - Sample branches
-- =============================================
INSERT INTO branches (name, address, phone, city) VALUES
  ('Sector 17, Chandigarh', 'SCO 142, Sector 17-C, Chandigarh', '0172-456-7890', 'Chandigarh'),
  ('Sector 35, Chandigarh', 'SCO 88, Sector 35-B, Chandigarh', '0172-567-8901', 'Chandigarh'),
  ('Phase 7, Mohali', 'Phase 7 Market, SAS Nagar, Mohali', '0172-678-9012', 'Mohali'),
  ('Panchkula, Sec 9', 'SCO 22, Sector 9, Panchkula', '0172-789-0123', 'Panchkula');

-- Seed Services
INSERT INTO services (name, category, duration_min, price_min, price_max) VALUES
  ('Hair Color (Global)', 'Hair', 120, 800, 1800),
  ('Hair Cut & Style', 'Hair', 45, 200, 500),
  ('Highlights / Balayage', 'Hair', 150, 1500, 4000),
  ('Keratin Treatment', 'Hair', 180, 2000, 4000),
  ('Hair Spa', 'Hair', 60, 500, 1200),
  ('Bridal Makeup (Full)', 'Bridal', 180, 8000, 15000),
  ('Bridal Trial', 'Bridal', 120, 3000, 5000),
  ('Party Makeup', 'Makeup', 60, 1500, 3000),
  ('Facial (Basic)', 'Skin', 45, 350, 600),
  ('Facial (Gold/Diamond)', 'Skin', 60, 800, 1500),
  ('Cleanup', 'Skin', 30, 200, 400),
  ('Waxing (Full Body)', 'Skin', 60, 700, 1200),
  ('Waxing (Arms/Legs)', 'Skin', 30, 200, 400),
  ('Manicure', 'Nails', 45, 250, 500),
  ('Pedicure', 'Nails', 45, 300, 600),
  ('Manicure + Pedicure', 'Nails', 90, 500, 900),
  ('Threading (Eyebrows)', 'Threading', 10, 50, 100),
  ('Threading (Full Face)', 'Threading', 30, 150, 250);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Simple open policies (tighten later with auth)
CREATE POLICY "Allow all" ON branches FOR ALL USING (true);
CREATE POLICY "Allow all" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all" ON ledger FOR ALL USING (true);
CREATE POLICY "Allow all" ON services FOR ALL USING (true);
