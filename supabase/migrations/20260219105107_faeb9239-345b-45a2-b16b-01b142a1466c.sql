
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
);
