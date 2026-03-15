
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_currency text NOT NULL DEFAULT 'USD';
