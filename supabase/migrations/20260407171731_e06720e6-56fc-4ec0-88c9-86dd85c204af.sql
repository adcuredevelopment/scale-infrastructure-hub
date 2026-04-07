CREATE POLICY "Affiliates can view referred customer subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  customer_email IN (
    SELECT ar.customer_email 
    FROM affiliate_referrals ar
    JOIN affiliates a ON ar.affiliate_id = a.id
    WHERE a.user_id = auth.uid()
  )
);