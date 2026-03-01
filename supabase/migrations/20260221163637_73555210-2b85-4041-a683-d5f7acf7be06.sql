
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
$$;
