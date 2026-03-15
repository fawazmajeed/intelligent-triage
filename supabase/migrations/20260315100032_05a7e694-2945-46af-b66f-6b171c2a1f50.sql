
-- Custom categories per organization
CREATE TABLE public.org_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

ALTER TABLE public.org_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org categories" ON public.org_categories
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can manage own org categories" ON public.org_categories
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can update own org categories" ON public.org_categories
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can delete own org categories" ON public.org_categories
  FOR DELETE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

-- Custom teams/routing groups per organization
CREATE TABLE public.org_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

ALTER TABLE public.org_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org teams" ON public.org_teams
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can manage own org teams" ON public.org_teams
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can update own org teams" ON public.org_teams
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can delete own org teams" ON public.org_teams
  FOR DELETE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

-- Training examples from historical data
CREATE TABLE public.org_training_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  description text NOT NULL,
  category text NOT NULL,
  team text,
  severity text,
  source text DEFAULT 'csv_upload',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.org_training_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org examples" ON public.org_training_examples
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can manage own org examples" ON public.org_training_examples
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can delete own org examples" ON public.org_training_examples
  FOR DELETE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));
