
-- Allow anonymous/public read access to tickets for the demo dashboard
CREATE POLICY "Public can view tickets" ON public.tickets
  FOR SELECT TO anon USING (true);
