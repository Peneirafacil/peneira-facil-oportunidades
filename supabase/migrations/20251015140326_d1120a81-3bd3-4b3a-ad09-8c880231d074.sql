-- =====================================================
-- SECURITY FIX: PUBLIC_DATA_EXPOSURE & MISSING_RLS
-- =====================================================

-- 1. Fix PUBLIC_DATA_EXPOSURE: Restrict profiles table access
-- =====================================================

-- Drop the overly permissive policy that allows anyone to view athlete profiles
DROP POLICY IF EXISTS "Everyone can view athlete profiles" ON public.profiles;

-- Create restrictive policy: users can only view their own full profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create a public view with only non-sensitive athlete data
CREATE OR REPLACE VIEW public.public_athlete_profiles AS
SELECT 
  id,
  full_name,
  position,
  biography,
  is_athlete,
  city,
  state,
  photo_url,
  instagram
FROM public.profiles
WHERE is_athlete = true;

-- Grant access to the public view
GRANT SELECT ON public.public_athlete_profiles TO authenticated, anon;


-- 2. Fix MISSING_RLS: Create dedicated user_roles system
-- =====================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'premium', 'user', 'moderator');

-- Create dedicated user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create security definer function for safe role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'premium' THEN 'premium'::app_role
    ELSE 'user'::app_role
  END
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing SECURITY DEFINER functions to use has_role() and SET search_path
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_premium()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin'::app_role, 'premium'::app_role)
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.subscription_tier IN ('mensal', 'premium', 'anual')
  );
$$;

-- Prevent users from updating their role column in profiles
CREATE OR REPLACE FUNCTION public.prevent_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow role updates from the system or admins
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Cannot modify role field. Use user_roles table instead.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to prevent role updates
DROP TRIGGER IF EXISTS prevent_role_update_trigger ON public.profiles;
CREATE TRIGGER prevent_role_update_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_update();

-- Add comment deprecating the role column
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: Use user_roles table instead. This column is kept for backward compatibility only.';