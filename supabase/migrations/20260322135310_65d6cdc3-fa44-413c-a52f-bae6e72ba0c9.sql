
-- Function: admin can list ALL organizations (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_list_organizations()
RETURNS SETOF public.organizations
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.organizations
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY created_at DESC
$$;

-- Function: admin can generate and assign a license key to an org
CREATE OR REPLACE FUNCTION public.admin_set_license_key(_org_id uuid, _license_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.organizations
  SET license_key = _license_key,
      is_licensed = true
  WHERE id = _org_id;
END;
$$;

-- Function: admin can revoke a license
CREATE OR REPLACE FUNCTION public.admin_revoke_license(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.organizations
  SET license_key = NULL,
      is_licensed = false
  WHERE id = _org_id;
END;
$$;

-- Function: list all users for admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, organization_id uuid, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email, u.organization_id, u.created_at
  FROM public.users u
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY u.created_at DESC
$$;
