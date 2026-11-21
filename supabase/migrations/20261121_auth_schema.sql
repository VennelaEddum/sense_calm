-- ======================================================================
-- Sense Calm Assistive Technology – Complete Database Schema & Security
-- PostgreSQL + Supabase Authentication + Row Level Security (RLS)
-- ======================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================================
-- TABLE 1: CAREGIVER PROFILES
-- Associated directly with Supabase auth.users
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.caregiver_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'caregiver' CHECK (role IN ('caregiver', 'teacher', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caregiver_email ON public.caregiver_profiles(email);

-- Trigger for updated_at
CREATE TRIGGER tr_caregiver_profiles_updated_at
BEFORE UPDATE ON public.caregiver_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 2: CHILD PROFILES
-- Caregiver-owned child accounts. Children do NOT need independent emails.
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 1 AND age <= 25),
  gender TEXT,
  preferred_comm_mode TEXT DEFAULT 'aac' CHECK (preferred_comm_mode IN ('aac', 'speech', 'mixed', 'gestures')),
  sensory_sensitivities TEXT[] DEFAULT '{}',
  favorite_calming_tools TEXT[] DEFAULT '{}',
  avatar_emoji TEXT DEFAULT '🐰',
  caregiver_pin TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_caregiver ON public.child_profiles(caregiver_id);

CREATE TRIGGER tr_child_profiles_updated_at
BEFORE UPDATE ON public.child_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 3: AAC CARDS
-- Custom communication cards & Familiar People created by caregivers
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.aac_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  telugu_label TEXT NOT NULL,
  emoji TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('needs', 'feelings', 'actions', 'food', 'people', 'family', 'school', 'places', 'emergency', 'comfort', 'custom')),
  is_familiar_person BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aac_cards_child ON public.aac_cards(child_id);
CREATE INDEX IF NOT EXISTS idx_aac_cards_caregiver ON public.aac_cards(caregiver_id);

CREATE TRIGGER tr_aac_cards_updated_at
BEFORE UPDATE ON public.aac_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 4: EMOTION LOGS
-- Child-selected emotion entries (strictly child-led with consent)
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  emotion_id TEXT NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  trigger_id TEXT,
  notes TEXT,
  consent_given BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotion_logs_child ON public.emotion_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_caregiver ON public.emotion_logs(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_created_at ON public.emotion_logs(created_at);

-- ======================================================================
-- TABLE 5: ROUTINES
-- Daily routine schedules configured by caregivers
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  telugu_title TEXT,
  category TEXT DEFAULT 'daily' CHECK (category IN ('daily', 'morning', 'afternoon', 'evening', 'school', 'bedtime')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routines_child ON public.routines(child_id);
CREATE INDEX IF NOT EXISTS idx_routines_caregiver ON public.routines(caregiver_id);

CREATE TRIGGER tr_routines_updated_at
BEFORE UPDATE ON public.routines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 6: ROUTINE STEPS
-- Individual chronological steps in a daily routine timeline
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.routine_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  telugu_title TEXT NOT NULL,
  instruction TEXT,
  time_hint TEXT,
  emoji TEXT NOT NULL DEFAULT '🌟',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routine_steps_routine ON public.routine_steps(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_steps_child ON public.routine_steps(child_id);

CREATE TRIGGER tr_routine_steps_updated_at
BEFORE UPDATE ON public.routine_steps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 7: LEARNING PROGRESS
-- Educational game sessions, points, accuracy and streaks
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  streak INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_child ON public.learning_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_caregiver ON public.learning_progress(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_date ON public.learning_progress(completed_at);

-- ======================================================================
-- TABLE 8: SENSORY PREFERENCES
-- Child-specific comfort themes, dimmer levels, audio rates, TTS voice
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.sensory_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE UNIQUE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  sensory_theme TEXT DEFAULT 'default' CHECK (sensory_theme IN ('default', 'sage', 'cream', 'night', 'sky')),
  brightness_overlay TEXT DEFAULT 'normal' CHECK (brightness_overlay IN ('normal', 'soft', 'dim')),
  reduced_motion BOOLEAN DEFAULT FALSE,
  quiet_mode BOOLEAN DEFAULT FALSE,
  speech_enabled BOOLEAN DEFAULT TRUE,
  tts_language TEXT DEFAULT 'en' CHECK (tts_language IN ('en', 'te')),
  tts_rate NUMERIC DEFAULT 0.88,
  tts_voice_uri TEXT,
  ambient_sound TEXT DEFAULT 'none' CHECK (ambient_sound IN ('none', 'rain', 'waves', 'forest')),
  ambient_volume NUMERIC DEFAULT 0.4,
  silent_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensory_preferences_child ON public.sensory_preferences(child_id);
CREATE INDEX IF NOT EXISTS idx_sensory_preferences_caregiver ON public.sensory_preferences(caregiver_id);

CREATE TRIGGER tr_sensory_preferences_updated_at
BEFORE UPDATE ON public.sensory_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- TABLE 9: EMERGENCY CONTACTS
-- Important caregiver and emergency contacts for a child
-- ======================================================================
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_child ON public.emergency_contacts(child_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_caregiver ON public.emergency_contacts(caregiver_id);

CREATE TRIGGER tr_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================
-- AUTOMATIC CAREGIVER PROFILE CREATION TRIGGER
-- When a user registers in Supabase Auth, populate caregiver_profiles
-- ======================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.caregiver_profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'caregiver'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users only access data belonging to their own children
-- ======================================================================

-- 1. Caregiver Profiles RLS
ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their own profile"
  ON public.caregiver_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Caregivers can update their own profile"
  ON public.caregiver_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Caregivers can insert their own profile"
  ON public.caregiver_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Child Profiles RLS
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their owned children"
  ON public.child_profiles FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can insert child profiles"
  ON public.child_profiles FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update their owned children"
  ON public.child_profiles FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete their owned children"
  ON public.child_profiles FOR DELETE
  USING (caregiver_id = auth.uid());

-- 3. AAC Cards RLS
ALTER TABLE public.aac_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their children's AAC cards"
  ON public.aac_cards FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can insert AAC cards for their children"
  ON public.aac_cards FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update their children's AAC cards"
  ON public.aac_cards FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete their children's AAC cards"
  ON public.aac_cards FOR DELETE
  USING (caregiver_id = auth.uid());

-- 4. Emotion Logs RLS
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their children's emotion logs"
  ON public.emotion_logs FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can record emotion logs"
  ON public.emotion_logs FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete emotion logs"
  ON public.emotion_logs FOR DELETE
  USING (caregiver_id = auth.uid());

-- 5. Routines RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their children's routines"
  ON public.routines FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can create routines"
  ON public.routines FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update routines"
  ON public.routines FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete routines"
  ON public.routines FOR DELETE
  USING (caregiver_id = auth.uid());

-- 6. Routine Steps RLS
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view routine steps"
  ON public.routine_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can insert routine steps"
  ON public.routine_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can update routine steps"
  ON public.routine_steps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Caregivers can delete routine steps"
  ON public.routine_steps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.child_profiles cp
      WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()
    )
  );

-- 7. Learning Progress RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view learning progress"
  ON public.learning_progress FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can record learning progress"
  ON public.learning_progress FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

-- 8. Sensory Preferences RLS
ALTER TABLE public.sensory_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view sensory preferences"
  ON public.sensory_preferences FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can insert sensory preferences"
  ON public.sensory_preferences FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update sensory preferences"
  ON public.sensory_preferences FOR UPDATE
  USING (caregiver_id = auth.uid());

-- 9. Emergency Contacts RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can insert emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can delete emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (caregiver_id = auth.uid());

-- ======================================================================
-- STORAGE BUCKET: AAC Media
-- For custom card images uploaded by caregivers
-- ======================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('aac-media', 'aac-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Caregiver media upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'aac-media' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Caregiver media access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'aac-media');
