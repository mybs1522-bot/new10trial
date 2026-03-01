
CREATE TABLE public.student_course_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.student_course_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course access" ON public.student_course_access FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Admins can manage course access" ON public.student_course_access FOR ALL USING (public.has_role(auth.uid(), 'admin'));
