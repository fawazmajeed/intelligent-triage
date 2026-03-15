
CREATE TABLE public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform_source text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  disconnected_at timestamp with time zone,
  UNIQUE (organization_id, platform_source)
);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org connections"
  ON public.integration_connections FOR SELECT TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can insert own org connections"
  ON public.integration_connections FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));

CREATE POLICY "Users can update own org connections"
  ON public.integration_connections FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()));
