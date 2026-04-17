-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS public.customer_invoice_seq START 1;

-- RPC to get next invoice number
CREATE OR REPLACE FUNCTION public.nextval_customer_invoice()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.customer_invoice_seq');
$$;

-- Customer invoices table
CREATE TABLE IF NOT EXISTS public.customer_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('shop_order', 'subscription_initial', 'subscription_renewal')),
  product_name TEXT NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  country TEXT,
  payment_id UUID UNIQUE,
  subscription_id UUID,
  pdf_path TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_invoices_email ON public.customer_invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_payment ON public.customer_invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_customer_invoices_issued_at ON public.customer_invoices(issued_at DESC);

ALTER TABLE public.customer_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer invoices"
  ON public.customer_invoices
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access customer invoices"
  ON public.customer_invoices
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-invoices', 'customer-invoices', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can read customer invoice files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access customer invoice files"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'customer-invoices')
  WITH CHECK (bucket_id = 'customer-invoices');