
-- Add missing columns to email_drip_templates
ALTER TABLE public.email_drip_templates ADD COLUMN IF NOT EXISTS step_name TEXT DEFAULT '';

-- Add missing columns to email_drip_queue
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS student_email TEXT DEFAULT '';
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS step_name TEXT DEFAULT '';
ALTER TABLE public.email_drip_queue ADD COLUMN IF NOT EXISTS delay_hours INTEGER DEFAULT 0;
