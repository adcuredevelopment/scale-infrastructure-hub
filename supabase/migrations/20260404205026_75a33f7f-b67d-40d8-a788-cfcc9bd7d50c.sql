
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;

CREATE POLICY "Users can create own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');
