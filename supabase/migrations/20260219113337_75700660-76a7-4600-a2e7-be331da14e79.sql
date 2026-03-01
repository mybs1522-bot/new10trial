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
$function$
