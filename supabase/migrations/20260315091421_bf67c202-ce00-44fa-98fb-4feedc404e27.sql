
-- Add license columns to organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS license_key text,
  ADD COLUMN IF NOT EXISTS is_licensed boolean NOT NULL DEFAULT false;

-- Change default trial to 7 days instead of 14
ALTER TABLE public.organizations 
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '7 days');

-- Create a function to auto-create org + user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a new organization for the user with 7-day trial
  INSERT INTO public.organizations (name, trial_expires_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', split_part(NEW.email, '@', 1) || '''s Org'),
    now() + interval '7 days'
  )
  RETURNING id INTO new_org_id;

  -- Create user record linked to the org
  INSERT INTO public.users (auth_id, email, organization_id)
  VALUES (NEW.id, NEW.email, new_org_id);

  -- Give them admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add policy for authenticated users to update their org (for license key)
CREATE POLICY "Users can update own organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid()));
