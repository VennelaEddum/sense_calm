# Sense Calm – Supabase Authentication & Database Integration

This guide provides complete instructions for setting up the Supabase PostgreSQL database, Authentication, and Row Level Security (RLS) for the **Sense Calm Assistive Technology** application.

---

## 1. Quick Setup in Supabase Dashboard

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and select your organization.
3. Choose a project name (e.g. `sense-calm`) and a strong database password.
4. Select a region close to your users.

---

### Step 2: Run the SQL Schema Migration
1. In your Supabase Dashboard, open the **SQL Editor** from the left sidebar.
2. Click **New Query**.
3. Open the file `sql/schema.sql` (or `supabase/migrations/20261121_auth_schema.sql`) from this project.
4. Copy the entire contents and paste them into the SQL Editor.
5. Click **Run** (or `Ctrl + Enter`).
6. Verify that all 9 tables, indexes, triggers, and RLS policies are created successfully:
   - `caregiver_profiles`
   - `child_profiles`
   - `aac_cards`
   - `emotion_logs`
   - `routines`
   - `routine_steps`
   - `learning_progress`
   - `sensory_preferences`
   - `emergency_contacts`
   - Storage bucket: `aac-media`

---

### Step 3: Obtain API Credentials
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Copy the **anon / public** key (found under *Project API keys*).
4. Update your local `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Database Schema Architecture

```
auth.users (Supabase Auth)
    │
    ▼ (1 : 1)
public.caregiver_profiles
    │
    ▼ (1 : N)
public.child_profiles
    │
    ├──► public.aac_cards (Custom AAC cards & Familiar People)
    ├──► public.emotion_logs (Child-led emotion check-ins)
    ├──► public.routines
    │       │
    │       └──► public.routine_steps (Chronological routine timeline)
    ├──► public.learning_progress (Scores, streaks, accuracy)
    ├──► public.sensory_preferences (Themes, brightness, TTS speed, ambient audio)
    └──► public.emergency_contacts (Caregiver & doctor contact numbers)
```

---

## 3. Row Level Security (RLS) Protection

Row Level Security is enabled on **all 9 tables**. The security rules enforce:
- **Caregiver Profile Isolation**: A user can only view, create, and edit their own `caregiver_profiles` record (`auth.uid() = id`).
- **Child Profile Ownership**: A user can only view, insert, update, and delete child profiles where `caregiver_id = auth.uid()`.
- **Deep Child Record Isolation**: AAC cards, emotion logs, routines, routine steps, learning progress, sensory settings, and emergency contacts are strictly constrained to records owned by the authenticated caregiver.
- **No ID Spoofing**: Changing child IDs or caregiver IDs in client requests is rejected by PostgreSQL RLS with `permission denied`.

---

## 4. Offline Synchronization & Conflict Strategy

- **Local-First Architecture**: When a child uses AAC cards, games, guided breathing, or daily routines offline, data is persisted locally via `localStorage` and `IndexedDB`.
- **Automatic Queue**: Offline mutations (new AAC cards, emotion logs, routine updates) are placed in a persistent sync queue (`sense_calm_sync_queue_v1`).
- **Seamless Resync**: As soon as the device reconnects to the network, `flushSyncQueue()` automatically sends queued updates to Supabase without duplicates or data loss.
- **Emergency Mode**: Remains 100% functional offline without requiring network or authentication.
