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
  USING (public.has_role(auth.uid(), 'admin'));;

-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;;

CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
-- No public access; only service role via edge functions can access this table;

-- Create email drip templates table (admin editable)
CREATE TABLE public.email_drip_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_name text NOT NULL, -- 'welcome', '6h', '12h', '24h'
  delay_hours integer NOT NULL DEFAULT 0,
  subject text NOT NULL DEFAULT '',
  html text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create email drip queue table (tracks per-student email sends)
CREATE TABLE public.email_drip_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  student_email text NOT NULL,
  step_name text NOT NULL,
  delay_hours integer NOT NULL DEFAULT 0,
  scheduled_at timestamp with time zone NOT NULL,
  sent_at timestamp with time zone NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_drip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drip_queue ENABLE ROW LEVEL SECURITY;

-- Templates: only admins can read/write
CREATE POLICY "templates_select_admin" ON public.email_drip_templates FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "templates_insert_admin" ON public.email_drip_templates FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "templates_update_admin" ON public.email_drip_templates FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "templates_delete_admin" ON public.email_drip_templates FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Queue: admins can read all; service role handles inserts/updates via edge functions
CREATE POLICY "queue_select_admin" ON public.email_drip_queue FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on templates
CREATE TRIGGER update_email_drip_templates_updated_at
  BEFORE UPDATE ON public.email_drip_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed default templates
INSERT INTO public.email_drip_templates (step_name, delay_hours, subject, html) VALUES
(
  'welcome', 0,
  'Welcome to Arch by Sha! 🎉',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <h1 style="color: #c9a86c;">Welcome to Arch by Sha!</h1>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">Hi there,</p>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">We''re thrilled to have you join our 1-month Interior Design Program. Your journey to becoming a confident interior designer starts now!</p>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">Head to your dashboard to watch the Introduction Video and explore everything that''s waiting for you.</p>
    <a href="https://design-pathfinder-pro.lovable.app/dashboard/start" style="display: inline-block; background: #c9a86c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Go to Dashboard →</a>
    <p style="color: #999; font-size: 13px; margin-top: 32px;">With love,<br/>Sha &amp; the Arch by Sha team</p>
  </div>'
),
(
  '6h', 6,
  'Your first step in the program 📐',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <h2 style="color: #c9a86c;">Have you watched the intro video?</h2>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">Hi again! Just checking in — the Introduction Video is the best place to start. It explains exactly how the program works and what to expect.</p>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">It''s short, clear, and will set you up for success.</p>
    <a href="https://design-pathfinder-pro.lovable.app/dashboard/start" style="display: inline-block; background: #c9a86c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Watch Now →</a>
    <p style="color: #999; font-size: 13px; margin-top: 32px;">— Sha</p>
  </div>'
),
(
  '12h', 12,
  'Your courses are ready 🏛️',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <h2 style="color: #c9a86c;">Your courses are waiting!</h2>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">The program covers everything from space planning to styling. Head over to the Courses tab and explore the full curriculum.</p>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">Remember — unlock all content to get access to every lesson, book, and site visit.</p>
    <a href="https://design-pathfinder-pro.lovable.app/dashboard/courses" style="display: inline-block; background: #c9a86c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Explore Courses →</a>
    <p style="color: #999; font-size: 13px; margin-top: 32px;">— Sha</p>
  </div>'
),
(
  '24h', 24,
  'Don''t miss out — your design journey is calling 🌟',
  '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
    <h2 style="color: #c9a86c;">It''s been a day — let''s get started!</h2>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">You signed up for Arch by Sha yesterday and we want to make sure you''re getting the most out of it. The program is designed to transform the way you think about spaces.</p>
    <p style="color: #444; font-size: 16px; line-height: 1.6;">If you have any questions, just reply to this email — we read every message.</p>
    <a href="https://design-pathfinder-pro.lovable.app/dashboard" style="display: inline-block; background: #c9a86c; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">Go to Dashboard →</a>
    <p style="color: #999; font-size: 13px; margin-top: 32px;">With love,<br/>Sha</p>
  </div>'
);;

CREATE TABLE public.site_visit_rsvp (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  visit_id uuid NOT NULL REFERENCES public.site_visits(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('coming', 'not_coming')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (student_id, visit_id)
);

ALTER TABLE public.site_visit_rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rsvp_select_own_or_admin" ON public.site_visit_rsvp
  FOR SELECT USING ((student_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "rsvp_insert_own" ON public.site_visit_rsvp
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "rsvp_update_own" ON public.site_visit_rsvp
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "rsvp_delete_own" ON public.site_visit_rsvp
  FOR DELETE USING (student_id = auth.uid());

CREATE TRIGGER update_site_visit_rsvp_updated_at
  BEFORE UPDATE ON public.site_visit_rsvp
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_execution_plan boolean NOT NULL DEFAULT false;;

-- Allow mode to be NULL so new/manual accounts trigger the mode selection screen
ALTER TABLE public.profiles ALTER COLUMN mode DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN mode DROP NOT NULL;;

-- Update handle_new_user to store NULL mode when not set via enrollment form
-- This ensures manually-created accounts see the mode selection screen on login
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, location, mode, experience_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'mode', ''), ''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner')
  );
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$function$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_trial boolean NOT NULL DEFAULT false;;

-- 1. Role enum & user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  mode TEXT DEFAULT '',
  experience_level TEXT DEFAULT 'beginner',
  has_paid BOOLEAN DEFAULT FALSE,
  has_execution_plan BOOLEAN DEFAULT FALSE,
  has_trial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, experience_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'experience_level', 'beginner')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_broadcast BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_broadcast = TRUE);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Site visits
CREATE TABLE public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  visit_time TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view site visits" ON public.site_visits FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage site visits" ON public.site_visits FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 5. Site visit RSVP
CREATE TABLE public.site_visit_rsvp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  visit_id UUID REFERENCES public.site_visits(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, visit_id)
);
ALTER TABLE public.site_visit_rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own RSVPs" ON public.site_visit_rsvp FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all RSVPs" ON public.site_visit_rsvp FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 6. Freelance projects
CREATE TABLE public.freelance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  budget TEXT DEFAULT '',
  location TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.freelance_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view freelance projects" ON public.freelance_projects FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage freelance projects" ON public.freelance_projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Freelance interests
CREATE TABLE public.freelance_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.freelance_projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, project_id)
);
ALTER TABLE public.freelance_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interests" ON public.freelance_interests FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Admins can view all interests" ON public.freelance_interests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 8. Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  certificate_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. Payment records
CREATE TABLE public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payment_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage payments" ON public.payment_records FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 10. Email drip templates
CREATE TABLE public.email_drip_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  html TEXT DEFAULT '',
  delay_hours INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_drip_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage drip templates" ON public.email_drip_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 11. Email drip queue
CREATE TABLE public.email_drip_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.email_drip_templates(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_drip_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage drip queue" ON public.email_drip_queue FOR ALL USING (public.has_role(auth.uid(), 'admin'));;

CREATE TABLE public.student_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.student_course_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course access" ON public.student_course_access FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage course access" ON public.student_course_access FOR ALL USING (public.has_role(auth.uid(), 'admin'));;

-- Add missing columns to email_drip_templates
ALTER TABLE public.email_drip_templates ADD COLUMN IF NOT EXISTS step_name TEXT DEFAULT '';

-- Add missing columns to email_drip_queue
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS student_email TEXT DEFAULT '';
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS step_name TEXT DEFAULT '';
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS delay_hours INTEGER DEFAULT 0;;

CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role should access this table (via edge functions)
-- No public policies needed;

ALTER TABLE public.otp_codes ADD COLUMN used boolean NOT NULL DEFAULT false;;

CREATE OR REPLACE FUNCTION public.get_profiles_with_email()
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  location text,
  mode text,
  experience_level text,
  has_paid boolean,
  has_execution_plan boolean,
  has_trial boolean,
  created_at timestamptz,
  updated_at timestamptz,
  email text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.location,
    p.mode,
    p.experience_level,
    p.has_paid,
    p.has_execution_plan,
    p.has_trial,
    p.created_at,
    p.updated_at,
    u.email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;;

