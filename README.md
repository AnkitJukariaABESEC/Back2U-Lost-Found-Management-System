# Back2U - College Campus Lost & Found System 🎓📦

> **A student-centric web platform engineered to report, search, and safely recover lost campus belongings.**

---

## 🌟 Core Features & Requirements Implemented

* **Student & Teacher Digital Campus ID System**:
  * Role-adaptive profile registration for **Students** and **Teachers / Faculty Members**:
    * **Students**: Full Name, College Email ID, Mobile No, College Admission No, Branch (*CSE-1, CSE-2, CSE-3, ECE, EEE, Mechanical, AI-ML, DS*), Section (custom typing area), Semester (1st–8th), and Roll Number.
    * **Teachers / Faculty**: Streamlined profile with Full Name, College Email ID, Mobile No, Faculty / Employee ID, and Faculty Designation (Branch and Section fields removed).
  * **Email OTP Verification Engine**:
    * Requires entering a valid college email address.
    * Dispatches a 6-digit OTP code to the email with an interactive verification interface and simulation preview.
    * Prevents profile creation until the email address is confirmed via OTP.
* **Finder Profile Inspector for Owners**:
  * When a student or teacher misplaces an item, they can view the full verified profile of whoever found it.
  * Direct contact channels built-in: **One-click Phone Call**, **WhatsApp Chat**, and **Campus Email** integration.
* **Student Attribution on Every Item**:
  * **Student Full Name**
  * **College Roll Number** (e.g., `21CS1045`)
  * **Class & Academic Department** (e.g., `B.Tech CSE - 4th Year`)
* **Real-time Live Search**:
  * Instant search by item title, description, location, student name, or roll number.
* **Category Filtering Chips**:
  * College ID Cards, Electronics & Gadgets, Keys & Wallets, Books & Stationery, Bags & Clothing, Accessories, and Others.
* **Dual Reporting System**:
  * **"I Found an Item"**: Log found belongings with image upload, campus location, and optional drop-off at official security desks.
  * **"I Lost My Belonging"**: Post queries to alert finders on campus.
* **Ownership Verification & Claim Flow**:
  * Confidential challenge-response proof (secret marks, wallpaper, lock screen pin, scratches).
  * Finder review with one-click claim approval/rejection.
  * Confetti celebration and automated state transition to `CLAIM_PENDING` $\rightarrow$ `RETURNED`.
* **Campus Security Drop-off Directory**:
  * Official counter locations, telephone extensions, and 24/7 operating hours for physical handovers.
* **Supabase Ready**:
  * Dual-mode architecture: Works seamlessly out-of-the-box via LocalStorage persistence with realistic sample data, and automatically connects to PostgreSQL when Supabase environment variables are provided.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, JavaScript (ESModules / JSX), Vite
* **Styling**: Tailwind CSS v4, Lucide Icons
* **Database & BaaS**: PostgreSQL / Supabase Client SDK (`@supabase/supabase-js`)
* **Interactions**: Canvas Confetti, LocalStorage Reactive State Cache

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🗄️ Supabase Integration Guide

To connect Back2U to a live Supabase PostgreSQL backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the table creation script:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    report_type TEXT NOT NULL DEFAULT 'FOUND',
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location_found TEXT NOT NULL,
    date_found DATE NOT NULL DEFAULT CURRENT_DATE,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    finder_name TEXT NOT NULL,
    finder_roll_no TEXT NOT NULL,
    finder_class TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    office_handover_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Create a `.env` file in the root of this project:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Restart the dev server (`npm run dev`). Back2U will automatically switch from Local Storage to live Supabase Postgres!
