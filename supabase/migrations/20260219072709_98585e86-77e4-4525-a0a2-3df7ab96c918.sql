
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM ───────────────────────────────────────────────────────────────────
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- ─── PROFILES ───────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  mode TEXT DEFAULT 'online' CHECK (mode IN ('offline', 'online')),
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'some_idea')),
  has_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─── USER ROLES ──────────────────────────────────────────────────────────────
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ─── HAS_ROLE SECURITY DEFINER FUNCTION ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ─── SITE VISITS ─────────────────────────────────────────────────────────────
CREATE TABLE public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_broadcast BOOLEAN DEFAULT FALSE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ─── FREELANCE PROJECTS ──────────────────────────────────────────────────────
CREATE TABLE public.freelance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.freelance_projects ENABLE ROW LEVEL SECURITY;

-- ─── FREELANCE INTERESTS ─────────────────────────────────────────────────────
CREATE TABLE public.freelance_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.freelance_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, project_id)
);
ALTER TABLE public.freelance_interests ENABLE ROW LEVEL SECURITY;

-- ─── CERTIFICATES ────────────────────────────────────────────────────────────
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL DEFAULT '',
  issued_by UUID REFERENCES auth.users(id),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ─── STUDENT COURSE ACCESS ───────────────────────────────────────────────────
CREATE TABLE public.student_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.student_course_access ENABLE ROW LEVEL SECURITY;

-- ─── PAYMENT RECORDS ─────────────────────────────────────────────────────────
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  razorpay_payment_id TEXT DEFAULT '',
  razorpay_order_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- ─── AUTO-UPDATE TIMESTAMPS ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, location, mode, experience_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'mode', 'online'),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner')
  );
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());
CREATE POLICY "user_roles_update_admin" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());
CREATE POLICY "user_roles_delete_admin" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

-- Site Visits — students can read, admins full access
CREATE POLICY "site_visits_select_auth" ON public.site_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_visits_insert_admin" ON public.site_visits FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_visits_update_admin" ON public.site_visits FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_visits_delete_admin" ON public.site_visits FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Messages
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR is_broadcast = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages_update" ON public.messages FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages_delete_admin" ON public.messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Freelance Projects — students can read, admins full CRUD
CREATE POLICY "freelance_projects_select" ON public.freelance_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "freelance_projects_insert_admin" ON public.freelance_projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "freelance_projects_update_admin" ON public.freelance_projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "freelance_projects_delete_admin" ON public.freelance_projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Freelance Interests
CREATE POLICY "freelance_interests_select" ON public.freelance_interests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "freelance_interests_insert" ON public.freelance_interests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "freelance_interests_delete" ON public.freelance_interests FOR DELETE TO authenticated
  USING (student_id = auth.uid());

-- Certificates
CREATE POLICY "certificates_select" ON public.certificates FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "certificates_insert_admin" ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "certificates_update_admin" ON public.certificates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "certificates_delete_admin" ON public.certificates FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Student Course Access
CREATE POLICY "course_access_select" ON public.student_course_access FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "course_access_insert_admin" ON public.student_course_access FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "course_access_delete_admin" ON public.student_course_access FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payment Records
CREATE POLICY "payment_records_select" ON public.payment_records FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "payment_records_insert" ON public.payment_records FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "payment_records_update_admin" ON public.payment_records FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
