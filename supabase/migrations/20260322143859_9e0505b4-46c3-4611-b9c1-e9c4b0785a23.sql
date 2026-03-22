-- Table to track user corrections on AI predictions
CREATE TABLE public.ticket_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  corrected_by uuid NOT NULL,
  field_name text NOT NULL,
  original_value text,
  corrected_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org corrections"
ON public.ticket_corrections FOR SELECT TO authenticated
USING (organization_id IN (
  SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()
));

CREATE POLICY "Users can insert own org corrections"
ON public.ticket_corrections FOR INSERT TO authenticated
WITH CHECK (organization_id IN (
  SELECT users.organization_id FROM users WHERE users.auth_id = auth.uid()
));

ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_corrections;