CREATE POLICY "Admins can read affiliate invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'affiliate-invoices'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Service role can upload affiliate invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'affiliate-invoices'
  AND public.has_role(auth.uid(), 'admin')
);