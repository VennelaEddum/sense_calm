-- ======================================================================
-- Sense Calm Assistive Technology – Complete Database Schema & Security
-- PostgreSQL + Supabase Authentication + Row Level Security (RLS)
-- Copy and run this script in Supabase Dashboard -> SQL Editor
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

-- 1. Caregiver Profiles
CREATE TABLE IF NOT EXISTS public.caregiver_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'caregiver' CHECK (role IN ('caregiver', 'teacher', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_caregiver_email ON public.caregiver_profiles(email);

CREATE OR REPLACE TRIGGER tr_caregiver_profiles_updated_at
BEFORE UPDATE ON public.caregiver_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Child Profiles
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

CREATE OR REPLACE TRIGGER tr_child_profiles_updated_at
BEFORE UPDATE ON public.child_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. AAC Cards
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

CREATE OR REPLACE TRIGGER tr_aac_cards_updated_at
BEFORE UPDATE ON public.aac_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Emotion Logs
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

-- 5. Routines
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

CREATE OR REPLACE TRIGGER tr_routines_updated_at
BEFORE UPDATE ON public.routines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Routine Steps
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

CREATE OR REPLACE TRIGGER tr_routine_steps_updated_at
BEFORE UPDATE ON public.routine_steps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Learning Progress
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

-- 8. Sensory Preferences
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

CREATE OR REPLACE TRIGGER tr_sensory_preferences_updated_at
BEFORE UPDATE ON public.sensory_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Emergency Contacts
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

CREATE OR REPLACE TRIGGER tr_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic Caregiver Profile Trigger
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.caregiver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aac_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensory_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Caregiver RLS
CREATE POLICY "Caregiver self-view" ON public.caregiver_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Caregiver self-update" ON public.caregiver_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Caregiver self-insert" ON public.caregiver_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Child Profiles RLS
CREATE POLICY "Child profiles view" ON public.child_profiles FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Child profiles insert" ON public.child_profiles FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Child profiles update" ON public.child_profiles FOR UPDATE USING (caregiver_id = auth.uid());
CREATE POLICY "Child profiles delete" ON public.child_profiles FOR DELETE USING (caregiver_id = auth.uid());

-- AAC Cards RLS
CREATE POLICY "AAC cards view" ON public.aac_cards FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "AAC cards insert" ON public.aac_cards FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "AAC cards update" ON public.aac_cards FOR UPDATE USING (caregiver_id = auth.uid());
CREATE POLICY "AAC cards delete" ON public.aac_cards FOR DELETE USING (caregiver_id = auth.uid());

-- Emotion Logs RLS
CREATE POLICY "Emotion logs view" ON public.emotion_logs FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Emotion logs insert" ON public.emotion_logs FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Emotion logs delete" ON public.emotion_logs FOR DELETE USING (caregiver_id = auth.uid());

-- Routines & Steps RLS
CREATE POLICY "Routines view" ON public.routines FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Routines insert" ON public.routines FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Routines update" ON public.routines FOR UPDATE USING (caregiver_id = auth.uid());
CREATE POLICY "Routines delete" ON public.routines FOR DELETE USING (caregiver_id = auth.uid());

CREATE POLICY "Routine steps view" ON public.routine_steps FOR SELECT USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()));
CREATE POLICY "Routine steps insert" ON public.routine_steps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()));
CREATE POLICY "Routine steps update" ON public.routine_steps FOR UPDATE USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()));
CREATE POLICY "Routine steps delete" ON public.routine_steps FOR DELETE USING (EXISTS (SELECT 1 FROM public.child_profiles cp WHERE cp.id = routine_steps.child_id AND cp.caregiver_id = auth.uid()));

-- Learning Progress RLS
CREATE POLICY "Learning view" ON public.learning_progress FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Learning insert" ON public.learning_progress FOR INSERT WITH CHECK (caregiver_id = auth.uid());

-- Sensory Preferences RLS
CREATE POLICY "Sensory view" ON public.sensory_preferences FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Sensory insert" ON public.sensory_preferences FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Sensory update" ON public.sensory_preferences FOR UPDATE USING (caregiver_id = auth.uid());

-- Emergency Contacts RLS
CREATE POLICY "Emergency view" ON public.emergency_contacts FOR SELECT USING (caregiver_id = auth.uid());
CREATE POLICY "Emergency insert" ON public.emergency_contacts FOR INSERT WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Emergency update" ON public.emergency_contacts FOR UPDATE USING (caregiver_id = auth.uid());
CREATE POLICY "Emergency delete" ON public.emergency_contacts FOR DELETE USING (caregiver_id = auth.uid());
