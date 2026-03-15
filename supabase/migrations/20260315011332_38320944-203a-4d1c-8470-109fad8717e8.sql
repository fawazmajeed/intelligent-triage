
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '14 days')
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create users/profiles table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  source_system TEXT NOT NULL,
  raw_description TEXT NOT NULL,
  predicted_category TEXT,
  predicted_severity TEXT,
  predicted_team TEXT,
  confidence_score NUMERIC,
  business_impact TEXT,
  synced_back_to_source BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own organization"
ON public.organizations FOR SELECT TO authenticated
USING (id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can view org tickets"
ON public.tickets FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create org tickets"
ON public.tickets FOR INSERT TO authenticated
WITH CHECK (organization_id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update org tickets"
ON public.tickets FOR UPDATE TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.users WHERE auth_id = auth.uid()));
