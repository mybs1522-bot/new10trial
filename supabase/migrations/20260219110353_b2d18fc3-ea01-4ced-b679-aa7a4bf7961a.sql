
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
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
