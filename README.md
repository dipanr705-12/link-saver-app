# LinkVault — Lifetime Link Saver Web Application

A modern, fast, and secure web application to save and organize links permanently with individual user accounts and **Row-Level Security (RLS)** so nobody else can view or delete your links.

---

## 🌟 Key Features
- **User Authentication**: Sign Up, Log In, and Log Out functionality using Supabase Auth.
- **Uncompromising Security & Isolation**: Uses PostgreSQL Row Level Security (RLS) policies. Only the authenticated user who created a link can read, edit, or delete it.
- **Lifetime Storage**: Data is kept permanently in Supabase's managed Postgres database with zero expiration.
- **Tagging & Categories**: Organize links into categories (Tools, Reading, Development, etc.).
- **Fast Search & Filter**: Search by title, domain, or notes in real-time.
- **Copy & Direct Launch**: Quick clipboard copy button and external tab launcher.
- **Free Live Deployment**: Built with Vite + React + Tailwind CSS, ready for 1-click deployment on Vercel or Netlify.

---

## 🚀 Step 1: Set Up Free Supabase Backend (2 Minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `link-saver-db`.
3. Once created, click on **SQL Editor** in the left sidebar.
4. Open the file `supabase-schema.sql` located in this project folder, paste its contents into the SQL Editor, and click **Run**:
   ```sql
   create table if not exists public.links (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users not null default auth.uid(),
     title text not null,
     url text not null,
     description text default '',
     category text default 'General',
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   alter table public.links enable row level security;

   create policy "Users can view own links"
     on public.links for select using (auth.uid() = user_id);

   create policy "Users can insert own links"
     on public.links for insert with check (auth.uid() = user_id);

   create policy "Users can update own links"
     on public.links for update using (auth.uid() = user_id);

   create policy "Users can delete own links"
     on public.links for delete using (auth.uid() = user_id);
   ```
5. In Supabase, go to **Project Settings** (gear icon) -> **API**.
6. Copy:
   - **Project URL**
   - **anon / public key**
7. Create a file named `.env` in the root folder of this project with:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

---

## 💻 Step 2: Running Locally

Open your terminal in `C:\Users\dipan roy\.gemini\antigravity\scratch\link-saver-app` and run:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Step 3: Make It Live (100% Free)

### Option A: Deploy with Vercel (Recommended)
1. Push this folder to your GitHub repository (or use the Vercel CLI).
2. Go to [vercel.com](https://vercel.com) and log in with GitHub.
3. Click **Add New Project** and select your GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**. Your app is live with a public `.vercel.app` URL for anyone to use!

### Option B: Deploy with Netlify
1. Go to [netlify.com](https://netlify.com) and connect your repository.
2. Set Build command: `npm run build`
3. Set Publish directory: `dist`
4. Add the two environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) under **Site configuration > Environment variables**.
5. Click **Deploy**.
