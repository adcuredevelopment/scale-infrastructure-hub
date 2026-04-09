-- Add TOS acceptance timestamp to affiliates
ALTER TABLE public.affiliates ADD COLUMN tos_accepted_at timestamptz;

-- Create affiliate_invoices table
CREATE TABLE public.affiliate_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  payout_id uuid NOT NULL REFERENCES public.affiliate_payouts(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoices"
ON public.affiliate_invoices
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can view own invoices"
ON public.affiliate_invoices
FOR SELECT
TO authenticated
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

CREATE POLICY "Service role full access invoices"
ON public.affiliate_invoices
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create storage bucket for affiliate invoices
INSERT INTO storage.buckets (id, name, public) VALUES ('affiliate-invoices', 'affiliate-invoices', false);

-- Storage policies: affiliates can download their own invoices
CREATE POLICY "Affiliates can view own invoice files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'affiliate-invoices'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Service role can upload invoice files
CREATE POLICY "Service role can manage invoice files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'affiliate-invoices')
WITH CHECK (bucket_id = 'affiliate-invoices');

-- Sequence for invoice numbering
CREATE SEQUENCE public.affiliate_invoice_seq START 1;