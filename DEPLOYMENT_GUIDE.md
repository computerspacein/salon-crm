# GlamSync Salon CRM — Deployment Guide
## Step 1: Supabase Setup (Database)

1. **supabase.com** pe jaao → "Start for free" → Sign up karo
2. "New Project" banao → Name: "glamsync-crm"
3. Password strong rakho (save kar lo!)
4. Region: **Southeast Asia (Singapore)** — India ke sabse paas
5. Project banne ka wait karo (~2 min)

6. **SQL Editor** mein jaao → `supabase-schema.sql` ka pura content paste karo → Run karo
   → Tables + seed data sab ban jayega

7. **Project Settings → API** mein jaao → copy karo:
   - `Project URL` (jaise: https://xxxx.supabase.co)
   - `anon/public key`

---

## Step 2: Environment Variables Set Karo

Project folder mein `.env` file banao:

```
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

Phir dobara build karo:
```
npm run build
```

---

## Step 3: GitHub pe Upload Karo

1. **github.com** → Sign up / Login
2. "New Repository" → Name: `glamsync-crm` → Public → Create
3. Terminal mein (salon-crm folder mein):

```bash
git init
git add .
git commit -m "GlamSync CRM initial commit"
git remote add origin https://github.com/YOUR_USERNAME/glamsync-crm.git
git push -u origin main
```

---

## Step 4: Vercel pe Deploy Karo (Free Hosting)

1. **vercel.com** → Sign up with GitHub
2. "New Project" → GitHub repo `glamsync-crm` select karo
3. Environment Variables add karo:
   - `REACT_APP_SUPABASE_URL` → apni URL
   - `REACT_APP_SUPABASE_ANON_KEY` → apni key
4. "Deploy" dabao → 2-3 minute mein live!

URL milega: `https://glamsync-crm.vercel.app`

---

## Step 5: Custom Domain (Optional - ₹500/year)

1. **GoDaddy.com** ya **BigRock.in** pe `.in` domain lo
   - `glamsyncsalon.in` ya `yoursalonname.in`
2. Vercel → Settings → Domains → Add domain
3. DNS records update karo (Vercel step-by-step guide deta hai)

---

## Total Cost Summary

| Item | Cost |
|------|------|
| Vercel Hosting | FREE |
| Supabase Database | FREE (up to 500MB) |
| GitHub | FREE |
| Custom .in Domain | ~₹500–800/year |
| **Total** | **~₹500/year** |

---

## Upgrade Path (Jab Business Bade Ho)

- **Supabase Pro**: $25/month → 8GB database, daily backups
- **Vercel Pro**: $20/month → custom domains, analytics
- **Domain**: Renewal ~₹800/year

---

## Files Structure

```
salon-crm/
├── src/
│   ├── pages/
│   │   ├── Dashboard.js      ← Charts, metrics
│   │   ├── Appointments.js   ← Booking management
│   │   ├── Customers.js      ← Customer database
│   │   ├── Staff.js          ← Staff management
│   │   ├── Accounting.js     ← Full ledger
│   │   ├── Invoices.js       ← GST invoices
│   │   ├── Expenses.js       ← Expense tracking
│   │   ├── Services.js       ← Service pricing
│   │   └── Branches.js       ← Branch management
│   ├── lib/
│   │   └── supabase.js       ← Database connection
│   └── App.js                ← Main app + sidebar
├── supabase-schema.sql        ← Database setup SQL
└── DEPLOYMENT_GUIDE.md        ← Yeh file!
```
