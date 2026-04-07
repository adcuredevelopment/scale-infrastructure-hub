
-- Create a restricted view that only exposes the fields affiliates need
CREATE VIEW public.affiliate_subscription_status AS
SELECT customer_email, status
FROM public.subscriptions;

-- Grant access to the view
GRANT SELECT ON public.affiliate_subscription_status TO authenticated;

-- Drop the overly permissive direct-table policy
DROP POLICY IF EXISTS "Affiliates can view referred customer subscriptions" ON public.subscriptions;

-- Re-create a policy on the VIEW is not needed since views inherit the definer's permissions.
-- Instead, add RLS on the view via a security-invoker approach.
-- Actually, Postgres views don't support RLS directly. We need to use a SECURITY INVOKER view
-- with RLS on the underlying table, OR use a security definer function.
-- 
-- Better approach: Keep the RLS policy on subscriptions but make the affiliate hook
-- query through a security-definer function that returns only needed columns.

-- Let's use a security definer function instead
CREATE OR REPLACE FUNCTION public.get_affiliate_cancelled_emails()
RETURNS TABLE(customer_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.customer_email
  FROM subscriptions s
  WHERE s.status = 'cancelled'
    AND s.customer_email IN (
      SELECT ar.customer_email
      FROM affiliate_referrals ar
      JOIN affiliates a ON ar.affiliate_id = a.id
      WHERE a.user_id = auth.uid()
    );
$$;

-- Drop the view we don't need
DROP VIEW IF EXISTS public.affiliate_subscription_status;

-- Drop the direct table policy since we're using the function now
DROP POLICY IF EXISTS "Affiliates can view referred customer subscriptions" ON public.subscriptions;
