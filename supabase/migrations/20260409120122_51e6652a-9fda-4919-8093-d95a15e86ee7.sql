CREATE OR REPLACE FUNCTION public.nextval_affiliate_invoice()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.affiliate_invoice_seq');
$$;