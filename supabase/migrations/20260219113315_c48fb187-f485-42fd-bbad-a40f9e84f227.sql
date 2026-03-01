-- Allow mode to be NULL so new/manual accounts trigger the mode selection screen
ALTER TABLE public.profiles ALTER COLUMN mode DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN mode DROP NOT NULL;
