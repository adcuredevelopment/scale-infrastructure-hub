ALTER TABLE public.affiliate_invoices REPLICA IDENTITY FULL;
ALTER TABLE public.affiliate_payouts REPLICA IDENTITY FULL;
ALTER TABLE public.affiliate_referrals REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_invoices;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_payouts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_referrals;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;