
-- Add user_id column (nullable for webhook-created payments without a logged-in user)
ALTER TABLE public.payments ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop the existing overly-broad service_role policy
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- Service role keeps full access (for edge functions)
CREATE POLICY "Service role can manage payments"
ON public.payments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can create payments linked to themselves
CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
