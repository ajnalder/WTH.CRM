-- Drop the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Keep only the policy that allows users to view their own profile
-- This policy already exists: "Users can view their own profile"